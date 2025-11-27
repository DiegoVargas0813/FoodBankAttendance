// ...existing code...
const path = require('path');
const fs = require('fs');
const mediaModel = require('../models/mediaModel');
const { UPLOAD_DIR } = require('../utils/upload');

/**
 * Upload handler: if user already has a file of this file_type, replace in place
 * (delete old disk file and update DB row). Otherwise insert new row.
 */
exports.upload = async (req, res) => {
  try {
    const idusers = req.user?.idusers || req.user?.id;
    if (!idusers) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const allowedTypes = ['ID_PHOTO', 'ADDRESS_PHOTO'];
    const fileType = String(req.body.file_type || '').toUpperCase();
    if (!allowedTypes.includes(fileType)) return res.status(400).json({ error: 'Invalid file_type' });

    // relative path to store in DB
    const relPath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');

    // Check existing record for this user+type
    const existing = await mediaModel.getByUserAndType(idusers, fileType);

    // If exists: delete old disk file (best-effort) and update db row
    if (existing) {
      try {
        const oldAbsolute = path.resolve(path.join(__dirname, '..', existing.file_path));
        const uploadDirAbs = path.resolve(UPLOAD_DIR);
        if (oldAbsolute.startsWith(uploadDirAbs) && fs.existsSync(oldAbsolute)) {
          fs.unlinkSync(oldAbsolute);
        }
      } catch (e) {
        console.warn('Failed to remove old media file:', e?.message || e);
      }

      await mediaModel.updateFilePath(existing.idfiles, relPath);
      const updatedRecord = { idfiles: existing.idfiles, idusers, file_path: relPath, file_type: fileType };
      return res.json({ success: true, file: updatedRecord });
    }

    // No existing: insert new row
    const record = await mediaModel.insertFile(idusers, relPath, fileType);
    return res.json({ success: true, file: record });
  } catch (err) {
    console.error('Upload error', err);
    // If DB failed and multer saved a file, try to remove the new file to avoid orphan
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {
      console.warn('Failed to cleanup newly uploaded file after error', e?.message || e);
    }
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
};

/**
 * Stream file by media id. Only allow owner or admin roles.
 */
exports.getFile = async (req, res) => {
  try {
    const idfiles = parseInt(req.params.id, 10);
    if (Number.isNaN(idfiles)) return res.status(400).json({ error: 'Invalid id' });

    const record = await mediaModel.getById(idfiles);
    if (!record) return res.status(404).json({ error: 'File not found' });

    const userId = req.user?.idusers || req.user?.id;
    const userRole = (req.user?.role || '').toUpperCase();

    if (record.idusers !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const absolute = path.resolve(path.join(__dirname, '..', record.file_path));
    if (!absolute.startsWith(path.resolve(UPLOAD_DIR))) {
      console.warn('Attempt to access file outside upload dir:', absolute);
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!fs.existsSync(absolute)) return res.status(404).json({ error: 'File missing on disk' });

    const ext = path.extname(absolute).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'private, max-age=60');
    const stream = fs.createReadStream(absolute);
    stream.on('error', (err) => {
      console.error('Stream error', err);
      res.status(500).end();
    });
    stream.pipe(res);
  } catch (err) {
    console.error('getFile error', err);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
};

/**
 * List files uploaded by current user
 */
exports.listUserFiles = async (req, res) => {
  try {
    const userId = req.user?.idusers || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const rows = await mediaModel.getByUser(userId);
    return res.json({ success: true, files: rows });
  } catch (err) {
    console.error('listUserFiles error', err);
    return res.status(500).json({ error: 'Failed to list files' });
  }
};

/**
 * Delete a file record and disk file by id. Only owner or admin.
 */
exports.deleteFile = async (req, res) => {
  try {
    const idfiles = parseInt(req.params.id, 10);
    if (Number.isNaN(idfiles)) return res.status(400).json({ error: 'Invalid id' });

    const record = await mediaModel.getById(idfiles);
    if (!record) return res.status(404).json({ error: 'File not found' });

    const userId = req.user?.idusers || req.user?.id;
    const userRole = (req.user?.role || '').toUpperCase();
    if (record.idusers !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // delete disk file (best-effort)
    try {
      const absolute = path.resolve(path.join(__dirname, '..', record.file_path));
      if (absolute.startsWith(path.resolve(UPLOAD_DIR)) && fs.existsSync(absolute)) {
        fs.unlinkSync(absolute);
      }
    } catch (e) {
      console.warn('Failed to remove media file from disk during delete:', e?.message || e);
    }

    await mediaModel.deleteById(idfiles);
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteFile error', err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
};