const express = require('express');
import {registerController} from '../controllers/authController.js';
//const registerController = require('../controllers/authController.js');

const router = express.Router();

// register routing
router.post('/register', registerController)

export default router;