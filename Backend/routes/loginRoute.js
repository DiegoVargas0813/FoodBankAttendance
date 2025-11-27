const express = require('express');
const router = express.Router();
const userController = require ('../controllers/loginController');
const authMiddleware = require ('../utils/authMiddleware');
const rateLimit = require('express-rate-limit');

// Login rate limiter: combines IP + submitted identifier (email/username) to reduce brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max attempts per window per key
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // prefer account identifier if present, fallback to IP
    const id = req.body && (req.body.email || req.body.username) ? String(req.body.email || req.body.username).toLowerCase() : req.ip;
    return `${req.ip}:${id}`;
  },
});

router.post('/login', loginLimiter, userController.login);

router.post('/register', userController.register);

module.exports = router;