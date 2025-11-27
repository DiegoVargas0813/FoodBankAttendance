// ...existing code...
const db = require('../connection');

exports.insertFile = (idusers, filePath, fileType) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO media_files (idusers, file_path, file_type) VALUES (?, ?, ?)';
    db.query(sql, [idusers, filePath, fileType], (err, result) => {
      if (err) return reject(err);
      resolve({ idfiles: result.insertId, idusers, file_path: filePath, file_type: fileType });
    });
  });
};

exports.getById = (idfiles) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT idfiles, idusers, file_path, file_type, uploaded_at FROM media_files WHERE idfiles = ? LIMIT 1';
    db.query(sql, [idfiles], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

exports.getByUser = (idusers) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT idfiles, idusers, file_path, file_type, uploaded_at FROM media_files WHERE idusers = ? ORDER BY uploaded_at DESC';
    db.query(sql, [idusers], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

// ...existing code...

// NEW: find single file for user and type (e.g. ID_PHOTO or ADDRESS_PHOTO)
exports.getByUserAndType = (idusers, fileType) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT idfiles, idusers, file_path, file_type, uploaded_at FROM media_files WHERE idusers = ? AND file_type = ? LIMIT 1';
    db.query(sql, [idusers, fileType], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

// NEW: update file_path (replace existing record)
exports.updateFilePath = (idfiles, newPath) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE media_files SET file_path = ?, uploaded_at = CURRENT_TIMESTAMP WHERE idfiles = ?';
    db.query(sql, [newPath, idfiles], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// NEW: delete row by id
exports.deleteById = (idfiles) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM media_files WHERE idfiles = ?';
    db.query(sql, [idfiles], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// NEW: return array of file_path strings (used by cleanup script)
exports.getAllFilePaths = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT file_path FROM media_files';
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve((results || []).map(r => r.file_path));
    });
  });
};