const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');

// Protected routes for users with role 'FAMILY'
router.post(
  '/create',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('FAMILY'),
  familyController.createFamily
);

// Save or update form JSON for the authenticated family user
router.put(
  '/form',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('FAMILY'),
  familyController.saveForm
);

// Retrieve saved form JSON for the authenticated family user
router.get(
  '/form',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('FAMILY'),
  familyController.getForm
);

// GET /api/admin/families/pending
router.get(
  '/pending',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  familyController.getPendingFamiliesAdmin
);

// PUT /api/admin/families/:id/status
router.put(
  '/:id/status',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  familyController.updateFamilyStatusAdmin
);

router.get(
  '/:id/export',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  familyController.exportFamilyExcel
);

router.get(
  '/status',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('FAMILY'),
  familyController.getStatus
);

router.get(
  '/approved',
  authMiddleware.verifyToken,
  roleMiddleware.checkRole('ADMIN'),
  familyController.getApprovedFamiliesAdmin
);


module.exports = router;