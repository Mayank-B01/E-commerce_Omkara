const express = require('express');
const { registerController,loginController, testController, forgotPassController } = require('../controllers/authController.js');
const {requireSignIn, isAdmin} = require('../middlewares/authMiddleware.js');
const router = express.Router();

// Register route
router.post('/register', registerController);

// LOGIN
router.post('/login', loginController);

// forgot password
router.post('/forgot-password', forgotPassController);

// Test
router.get('/test',requireSignIn, isAdmin, testController)

// protected user route
router.get('/user-auth', requireSignIn, (req, res) =>{
    res.status(200).send({ok:true});
})

// protected admin route
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) =>{
    res.status(200).send({ok:true});
})

module.exports = router;
