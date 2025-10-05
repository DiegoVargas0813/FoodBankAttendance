const express = require('express');
const router = express.Router();
const userController = require ('../controllers/loginController');
const authMiddleware = require ('../utils/authMiddleware');

router.post('/login', userController.login);

router.post('/register', userController.register);

module.exports = router;