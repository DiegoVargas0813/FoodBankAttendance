const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const rateLimit = require('express-rate-limit');


// Rate limiters
const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 1 request per IP per minute for admin invite actions
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
});

const acceptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 accept attempts per IP per 15 minutes
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

// Admin-only: create and manage invites
router.post(
  '/',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  adminWriteLimiter,
  inviteController.createInvite
);
router.get(
  '/',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  inviteController.listInvites
);
router.post(
  '/:token/resend',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  adminWriteLimiter,
  inviteController.resendInvite
);
router.post(
  '/:token/cancel',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  adminWriteLimiter,
  inviteController.cancelInvite
);

// Public: accept the invite and create account (rate limited to prevent brute-force)
router.post('/accept', acceptLimiter, inviteController.acceptInvite);

module.exports = router;