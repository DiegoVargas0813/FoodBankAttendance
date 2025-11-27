const loginModel = require('../models/loginModel');
const familyModel = require('../models/familyModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const { sendConfirmationEmail, sendResetEmail } = require('../utils/email');


const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT handling
const crypto = require('crypto'); // For generating tokens

const JWT_SECRET = process.env.JWT_SECRET  // Ensure you have this in your .env file
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // keep short
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
const RESET_EXPIRE_HOURS = Number(process.env.PASSWORD_RESET_HOURS || 2);

// Helper function to sign access tokens
function signAccessToken(payload){
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}

// Helper function to create refresh tokens
// These are used to obtain new access tokens without re-authenticating
function createRefreshTokenString() {
  return crypto.randomBytes(64).toString('hex'); // long random string
}

// Helper function to hash tokens before storing
// These is used to securely store refresh tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}


exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Try to find the user
    try {
        const user = await loginModel.fetchUserByEmail(email);
        // Check if user exists
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)   return res.status(401).json({ error: 'Invalid credentials' });

        if(!user.is_confirmed) {
            return res.status(403).json({ error: 'Email not confirmed', email: user.email });
        }

        // Prepare payload for JWT
        const tokenVersion = await loginModel.getTokenVersion(user.idusers);
        const payload = {
            id: user.idusers,
            email: user.email,
            username: user.username,
            role: user.role,
            tokenVersion: tokenVersion || 0,
        }

        // Issue access token
        const accessToken = signAccessToken(payload);

        // Creater and persist refresh token (hash for DB)
        // TODO: This implementation allows for single device support, let's try later to make it to support various
        await refreshTokenModel.deleteByUserId(user.idusers);
        const refreshToken = createRefreshTokenString();
        const refreshHash = hashToken(refreshToken);
         const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
        await refreshTokenModel.saveRefreshToken(user.idusers, refreshHash, expiresAt);

        // set HttpOnly cooki with refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/api',
            expires: expiresAt,
        });



        res.json({ 
            message: 'Login successful',
            user: {
                id: user.idusers,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            accessToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

//Refresh endpoin - rotates token and issues new one
exports.refreshToken = async (req, res) => {
    try {
        const cookieToken = req.cookies?.refreshToken;
        if(!cookieToken) return res.status(401).json({error: 'No refresh token'});

        const hash = hashToken(cookieToken);
        const row = await refreshTokenModel.findByTokenHash(hash);
        if(!row) return res.status(401).json({error: 'Invalid refresh token'});

        //Check expiration
        if(new Date(row.expires_at ) < new Date()){

            //Remove expirted token
            await refreshTokenModel.deleteByTokenHash(hash);
            return res.status(401).json({error: 'Refresh token expired'})
        }

        // fetch user to build payload
        const user = await loginModel.fetchUserById(row.idusers);
        if(!user) return res.status(404).json({error: 'User not found'})

        const tokenVersion = await loginModel.getTokenVersion(user.idusers);
        const payload = {
            id: user.idusers,
            email: user.email,
            username: user.username,
            role: user.role,
            tokenVersion: tokenVersion || 0,
        }

        // rotate refresh token: delete old, make new
        await refreshTokenModel.deleteByTokenHash(hash);
        const newRefresh = createRefreshTokenString();
        const newHash = hashToken(newRefresh);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
        await refreshTokenModel.saveRefreshToken(user.idusers, newHash, expiresAt);
        
        //set roated cookie
        res.cookie('refreshToken', newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/api',
            expires: expiresAt,
        });

        // sign new access token
        const accessToken = signAccessToken(payload);
        res.json({ accessToken, user: { id: user.idusers, email: user.email, username: user.username, role: user.role } });
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.logout = async (req, res) => {
  try {
    const cookieToken = req.cookies?.refreshToken;
    // if cookie exists remove its DB record
    if (cookieToken) {
      const hash = hashToken(cookieToken);
      await refreshTokenModel.deleteByTokenHash(hash);
    }
    // if user authenticated, also delete all refresh tokens for that user and bump tokenVersion
    const userId = req.user?.id;
    if (userId) {
      await refreshTokenModel.deleteByUserId(userId);
      await loginModel.incrementTokenVersion(userId);
    }

    // clear cookie
    res.clearCookie('refreshToken', { path: '/api' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

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