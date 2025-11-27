const express = require('express');
const router = express.Router();
const userController = require ('../controllers/userController');
const authMiddleware = require ('../utils/authMiddleware');
const roleMiddleware = require ('../utils/roleMiddleware');

// GET /api/users/me -> authenticated user's profile
router.get('/me', authMiddleware.verifyToken, userController.getMe);

// Admin-only: GET /api/users/admin/:id
router.get('/admin/:id', authMiddleware.verifyToken, roleMiddleware.checkRole('ADMIN'), userController.getUserByIdAdminOnly);

module.exports = router;