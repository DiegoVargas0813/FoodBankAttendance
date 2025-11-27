const db = require('../connection'); // Your DB connection
const bcrypt = require('bcrypt'); // For password hashing

//This model composes the logic for the login route, which is our only unprotected route.
//Any other routes will require a valid JWT token to access, which will be granted upon successful login.

exports.fetchUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE idusers = ? LIMIT 1', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows && rows.length ? rows[0] : null);
    });
  });
};

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


//Note: check the code matching with DB schema
//DOING: Adding email confirmation token logic
exports.postNewUser = async (user) => {
    if (!user.email || !user.password || !user.username || !user.role) {
        throw new Error('Missing required fields');
    }

    // Check if email is already in use
    const emailCheck = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [user.email], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
    if (emailCheck.length > 0) {
        throw new Error('Email is already in use');
    }

    const { email, password, username, role } = user;
    const hashedPassword = bcrypt.hashSync(password, 12);
    const confirmationToken = require('crypto').randomBytes(32).toString('hex');

    return await new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO users (email, password, username, role, confirmation_token) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, username, role, confirmationToken],
            (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, ...user, confirmationToken });
            }
        );
    });
};

exports.getTokenVersion = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT token_version FROM users WHERE idusers = ? LIMIT 1', [userId], (err, rows) => {
      if (err) return reject(err);
      if (!rows || !rows.length) return resolve(null);
      resolve(rows[0].token_version || 0);
    });
  });
};

exports.incrementTokenVersion = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET token_version = token_version + 1 WHERE idusers = ?', [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// NEW: delete unconfirmed user by email
exports.deleteUnconfirmedByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM users WHERE email = ? AND is_confirmed = FALSE';
    db.query(sql, [email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// NEW: delete unconfirmed accounts older than N days
exports.deleteUnconfirmedOlderThanDays = (days = 30) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM users WHERE is_confirmed = FALSE AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)';
    db.query(sql, [days], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


exports.setConfirmationTokenForEmail = (email, token) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET confirmation_token = ? WHERE email = ?';
    db.query(sql, [token, email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

//Password reset token methods
exports.setPasswordResetForEmail = (email, token, expiresAt) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?';
    db.query(sql, [token, expiresAt, email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.findByPasswordResetToken = (token) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE password_reset_token = ? LIMIT 1';
    db.query(sql, [token], (err, rows) => {
      if (err) return reject(err);
      resolve(rows && rows.length ? rows[0] : null);
    });
  });
};

exports.updatePasswordByEmail = (email, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE email = ?';
    db.query(sql, [hashedPassword, email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};