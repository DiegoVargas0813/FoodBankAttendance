const db = require('../connection'); // Your DB connection

// Fetch user by ID (safe fields only)
exports.fetchUserById = (id) => {
    return new Promise((resolve,reject) => {
        const sql = 'SELECT idusers, email, username, role, created_at, is_confirmed FROM users WHERE idusers = ? LIMIT 1';
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0] || null);
        });
    });
}