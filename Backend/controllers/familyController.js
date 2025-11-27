const familyModel = require('../models/familyModel');
const { builWorkbookFromFamily } = require('../utils/excelHelper');

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const mediaModel = require('../models/mediaModel');
const { UPLOAD_DIR } = require('../utils/upload');

//Normally a family is created upon user creation
exports.createFamily = async (req, res) => {
  try {
    const idusers = req.user?.id || req.user?.userId;
    if (!idusers) return res.status(400).json({ error: 'Missing user id in token' });

    //const { household_size = null, notes = null } = req.body;
    const result = await familyModel.createFamilyForUser(idusers);
    return res.status(201).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.saveForm = async (req, res) => {
  try {
    const idusers = req.user?.id || req.user?.userId;
    if (!idusers) return res.status(400).json({ error: 'Missing user id in token' });

    const formData = req.body.form_data ?? req.body;
    if (!formData) return res.status(400).json({ error: 'Missing form_data in request body' });

    // persist JSON
    await familyModel.insertFormJSON(idusers, JSON.stringify(formData));

    // Set or reset user status to pending after a successful form submission
    // This uses existing familyModel.updateFamilyStatusByUser(idusers, status)
    try {
      await familyModel.updateFamilyStatusByUser(idusers, 'submitted');
    } catch (statusErr) {
      console.warn('Failed to update family status to pending after form save:', statusErr?.message || statusErr);
      // Continue — form was saved, but log the status update failure
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getForm = async (req, res) => {
  try {
    const idusers = req.user?.id || req.user?.userId;
    if (!idusers) return res.status(400).json({ error: 'Missing user id in token' });

    const form = await familyModel.getFormByUser(idusers);
    if (!form) return res.status(404).json({ error: 'No form found for this user' });
    return res.json({ form_data: form });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Admin: list pending families
exports.getPendingFamiliesAdmin = async (req, res) => {
  try {
    const rows = await familyModel.getPendingFamilies();
    return res.json({ families: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getApprovedFamiliesAdmin = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.max(1, Math.min(200, parseInt(String(req.query.pageSize || '10'), 10) || 10));

    const { rows, total } = await familyModel.getApprovedFamiliesPaged(q, page, pageSize);
    return res.json({ families: rows, total, page, pageSize });
  } catch (err) {
    console.error('getApprovedFamiliesAdmin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin: update family status (approve / reject)
exports.updateFamilyStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing family id' });
    if (!['approved', 'rejected', 'pending'].includes(String(status))) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await familyModel.updateFamilyStatus(id, status);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const idusers = req.user?.id || req.user?.idusers;
    if (!idusers) return res.status(400).json({ error: 'Missing user id in token' });

    const family = await familyModel.getFamilyByUser(idusers);
    if (!family) return res.status(404).json({ error: 'Family not found' });

    return res.json({ success: true, status: family.status || 'pending' });
  } catch (err) {
    console.error('getStatus error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};


const { buildWorkbookFromFamily } = require('../utils/excelHelper');

exports.exportFamilyExcel = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing family id' });

    const family = await familyModel.getFamilyById(id);
    if (!family) return res.status(404).json({ error: 'Family not found' });

    // Authorization: allow admin or owner
    const requestingUserId = req.user?.id || req.user?.idusers || null;
    const requestingRole = (req.user?.role || '').toUpperCase();
    if (requestingRole !== 'ADMIN' && family.idusers !== requestingUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Audit log
    const exportedBy = requestingUserId || null;
    console.log(`EXPORT: family ${id} exported by user ${exportedBy} at ${new Date().toISOString()}`);

    // Build workbook buffer
    const workbook = buildWorkbookFromFamily(family);
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Collect image files:
    // Prefer explicit media references in form_data.media_files (array of { idfiles, file_path, file_type })
    let imageRecords = [];
    try {
      const fd = family.form_data || {};
      if (Array.isArray(fd.media_files) && fd.media_files.length > 0) {
        imageRecords = fd.media_files.filter(Boolean).map(f => ({
          idfiles: f.idfiles,
          file_path: f.file_path,
          file_type: f.file_type,
        }));
      } else {
        // Fallback: fetch any files for the family owner from media table
        imageRecords = await mediaModel.getByUser(family.idusers);
      }
    } catch (e) {
      console.warn('Could not read media references from family.form_data, falling back to DB lookup', e?.message || e);
      imageRecords = await mediaModel.getByUser(family.idusers);
    }

    // Prepare streaming zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="family_${family.idfamilies}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
      console.error('Archive error', err);
      try { res.status(500).end(); } catch {}
    });

    archive.pipe(res);

    // Add the excel workbook as the root file
    archive.append(excelBuffer, { name: `family_${family.idfamilies}.xlsx` });

    // Add images under images/ subfolder; ensure file path is inside UPLOAD_DIR and file exists
    const uploadDirAbs = path.resolve(UPLOAD_DIR);

    for (const r of imageRecords) {
      if (!r || !r.file_path) continue;
      const absolute = path.resolve(path.join(__dirname, '..', r.file_path));
      // Security: only include files inside UPLOAD_DIR
      if (!absolute.startsWith(uploadDirAbs)) {
        console.warn('Skipping file outside upload dir:', absolute);
        continue;
      }
      if (!fs.existsSync(absolute)) {
        console.warn('Skipping missing file:', absolute);
        continue;
      }
      // Create a safe name: <filetype>_<idfiles><ext> or fallback to basename
      const ext = path.extname(absolute) || '';
      const base = r.idfiles ? `${String(r.file_type || 'file').toLowerCase()}_${r.idfiles}${ext}` : path.basename(absolute);
      archive.file(absolute, { name: `Documentos/${base}` });
    }

    // Finalize the archive (will stream to client)
    await archive.finalize();
    // Do not call res.end() — archiver pipes and ends the response when done.
  } catch (err) {
    console.error('Failed to export family', err);
    // If headers not sent:
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to create export' });
    } else {
      try { res.end(); } catch {}
    }
  }
};