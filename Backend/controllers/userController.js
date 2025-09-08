const userModel = require('../models/userModel');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT handling


const JWT_SECRET = process.env.JWT_SECRET  // Ensure you have this in your .env file
const JWT_EXPIRES_IN = '1h'; // Token expiration time

// Ejemplo de ruta protegida
exports.getUserByIdProtected = async (req, res) => {
    try {
        const user = await userModel.fetchUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// TODO: Convertir en ruta protegida
exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.fetchUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.fetchUserByEmail(email);
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
            name: user.name
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