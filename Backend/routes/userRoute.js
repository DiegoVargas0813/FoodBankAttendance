const express = require('express');
const router = express.Router();
const userController = require ('../controllers/userController');
const authMiddleware = require ('../utils/authMiddleware');
const roleMiddleware = require ('../utils/roleMiddleware');

//Ejemplo de ruta protegida
router.get('/protected/:id', authMiddleware.verifyToken, userController.getUserById);

//Ejemplo de ruta protegida + control de rol
router.get('/admin/:id', authMiddleware.verifyToken, roleMiddleware.checkRole('ADMIN'), userController.getUserByIdAdminOnly);

//Ejemplo de ruta no protegida
router.get('/:id', userController.getUserById);

module.exports = router;