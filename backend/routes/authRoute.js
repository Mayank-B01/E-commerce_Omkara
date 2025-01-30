const express = require('express');
const { registerController,loginController, testController } = require('../controllers/authController.js');
const {requireSignIn, isAdmin} = require('../middlewares/authMiddleware.js');
const router = express.Router();

// Register route
router.post('/register', registerController);

// LOGIN
router.post('/login', loginController);

// Test
router.get('/test',requireSignIn, isAdmin, testController)



module.exports = router;
