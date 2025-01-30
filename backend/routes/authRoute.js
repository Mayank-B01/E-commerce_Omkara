const express = require('express');
const { registerController } = require('../controllers/authController.js');

const router = express.Router();

// Register route
router.post('/register', registerController);

module.exports = router;
