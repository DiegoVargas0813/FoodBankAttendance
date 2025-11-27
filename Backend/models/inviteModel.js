const db = require('../connection');

exports.createInvite = ({ email, role = 'ADMIN', token, expiresAt, invited_by = null }) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO invites (email, role, token, expires_at, invited_by) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [email, role, token, expiresAt, invited_by], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, email, role, token, expiresAt, invited_by });
    });
  });
};

exports.findByToken = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM invites WHERE token = ? LIMIT 1`;
    db.query(sql, [token], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0] || null);
    });
  });
};

exports.findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM invites WHERE email = ? ORDER BY created_at DESC`;
    db.query(sql, [email], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
};

exports.listInvites = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT i.*, u.username AS invited_by_username FROM invites i LEFT JOIN users u ON i.invited_by = u.idusers ORDER BY i.created_at DESC`;
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
};

exports.markUsed = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE invites SET used = 1 WHERE token = ?`;
    db.query(sql, [token], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.extendInvite = (token, newExpiresAt) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE invites SET expires_at = ? WHERE token = ?`;
    db.query(sql, [newExpiresAt, token], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.cancelInvite = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE invites SET used = 1 WHERE token = ?`;
    db.query(sql, [token], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};