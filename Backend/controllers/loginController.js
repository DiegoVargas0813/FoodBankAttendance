const loginModel = require('../models/loginModel');
const familyModel = require('../models/familyModel');
const { sendConfirmationEmail } = require('../utils/email');

const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT handling

const JWT_SECRET = process.env.JWT_SECRET  // Ensure you have this in your .env file
const JWT_EXPIRES_IN = '1h'; // Token expiration time

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await loginModel.fetchUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = {
            id: user.idusers,
            email: user.email,
            username: user.username,
            role: user.role
        }

        //Generate JWT
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({ 
            message: 'Login successful',
            user: payload,
            jwt: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Base User Registration, other roles will be handled in their own controllers
exports.register = async (req, res) => { 
    const {email,password, username,role} = req.body;
    try {
        const newUser = await loginModel.postNewUser({email,password, username,role});
        
        //Registration always creates a family record (Roles like administrator and aid_worker can ignore this)
        let family = null;
        family = await familyModel.createFamilyForUser(newUser.id);

        //Confirmation email
        await sendConfirmationEmail(email, newUser.confirmationToken);

        res.status(201).json({ 
            message: 'User registered successfully, check your email',
            user: newUser,
            family
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
