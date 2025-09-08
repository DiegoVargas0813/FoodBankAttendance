const express = require('express');
const router = express.Router();
const userController = require ('../controllers/userController');
const authMiddleware = require ('../utils/authMiddleware');

//Ejemplo de ruta protegida
router.get('/protected/:id', authMiddleware.verifyToken, userController.getUserById);

//Ejemplo de ruta no protegida
router.get('/:id', userController.getUserById);

router.post('/login', userController.login);

module.exports = router;