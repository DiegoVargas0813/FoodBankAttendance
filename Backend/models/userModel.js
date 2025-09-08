const db = require('../connection'); // Your DB connection

// Fetch user by ID
exports.fetchUserById = (id) => {
    return new Promise((resolve,reject) => {
        db.query('SELECT * FROM users WHERE idusers = ?', [id], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]);
        });
    });
}

exports.fetchUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]); // Return the user object (or undefined if not found)
        });
    });
}
