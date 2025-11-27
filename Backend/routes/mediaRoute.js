// ...existing code...
const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const { upload } = require('../utils/upload');
const mediaController = require('../controllers/mediaController');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many upload attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/media/upload
router.post(
  '/upload',
  authMiddleware.verifyToken,
  uploadLimiter,
  upload.single('file'),
  mediaController.upload
);

// GET /api/media/my/list -> list current user's files (must come before param route)
router.get('/my/list', authMiddleware.verifyToken, mediaController.listUserFiles);

// GET /api/media/:id -> stream single file to owner or admin
router.get('/:id', authMiddleware.verifyToken, mediaController.getFile);

// DELETE /api/media/:id -> delete a file (owner or admin)
router.delete('/:id', authMiddleware.verifyToken, mediaController.deleteFile);

module.exports = router;