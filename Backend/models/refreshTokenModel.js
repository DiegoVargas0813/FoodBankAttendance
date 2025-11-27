const db = require('../connection');
const { promisify } = require('util');

exports.saveRefreshToken  = (idusers, tokenHash, expiresAt) => {
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO refresh_tokens (idusers, token_hash, expires_at) VALUES (?,?,?)',
            [idusers, tokenHash, expiresAt],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

exports.findByTokenHash = (tokenHash) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows && rows.length ? rows[0] : null);
      }
    );
  });
};

exports.deleteByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM refresh_tokens WHERE idusers = ?',
      [userId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.deleteByTokenHash = (tokenHash) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM refresh_tokens WHERE token_hash = ?',
      [tokenHash],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};