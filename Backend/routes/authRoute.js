const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const authMiddleware = require('../utils/authMiddleware');

// POST /api/auth/refresh  (uses cookie; no auth header required)
router.post('/refresh', loginController.refreshToken);

// POST /api/auth/logout  (optional: accept token and clear cookie)
// If user has access token, attach verifyToken to get user context; otherwise the handler will clear cookie anyway.
router.post('/logout', authMiddleware.verifyToken, loginController.logout);

module.exports = router;