const express = require('express');
const router = express.Router();
const { getTestData } = require('../controllers/testingController');

router.get('/users', getTestData);

module.exports = router;