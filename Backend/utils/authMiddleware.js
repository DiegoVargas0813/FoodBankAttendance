const jwt = require('jsonwebtoken');
const loginModel = require('../models/loginModel');

const verifyToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // If using Bearer format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        // Check tokenVersion to allow revocation
        try {
            const dbVersion = await loginModel.getTokenVersion(decoded.idtoken);
            if(typeof dbVersion === 'number' && decoded.tokenVersion !== dbVersion){
                return res.status(401).json({ error: 'Token revoked.' });
            }
        } catch (e) {
            console.error('Error checking token version', e);
            // continue or deny
        }
        
        req.user = decoded;
        next();
    });
}

module.exports = { verifyToken };