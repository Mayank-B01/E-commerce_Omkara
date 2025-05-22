const express = require('express');
const router = express.Router();
const { processMessage } = require('../controllers/dialogflowController.js');

// Route to process messages
router.post('/message', processMessage);

module.exports = router; 