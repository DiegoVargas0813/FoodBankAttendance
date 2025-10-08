const db = require('../connection'); // Your DB connection
const bcrypt = require('bcrypt'); // For password hashing

//This model composes the logic for the login route, which is our only unprotected route.
//Any other routes will require a valid JWT token to access, which will be granted upon successful login.

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
exports.postNewUser = (user) => {
    return new Promise((resolve, reject) => {
        try{
            if (!user.email || !user.password || !user.username || !user.role) {
                throw new Error('Missing required fields');
            }
        } catch (error) {
            return reject(error);
        }

        try{
            //Check if email is already in use
            db.query('SELECT * FROM users WHERE email = ?', [user.email], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                if (rows.length > 0) {
                    return reject(new Error('Email is already in use'));
                }
            });
        } catch (error) {
            return reject(error);
        }

        
        const { email, password, username, role } = user;
        const hashedPassword = bcrypt.hashSync(password, 12); // Hash the password
        const confirmationToken = require('crypto').randomBytes(32).toString('hex'); // Generate a random token
        
        console.log('Registering user:', { email, username, hashedPassword, role }); // Debug log
        
        db.query('INSERT INTO users (email, password, username, role, confirmation_token) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, username, role, confirmationToken], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve({ id: result.insertId, ...user, confirmationToken }); // Return the newly created user with its ID
        });
    });
}
