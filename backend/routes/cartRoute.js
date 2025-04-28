const express = require('express');
const { requireSignIn } = require('../middlewares/authMiddleware');
const {
    addToCartController,
    getCartController,
    removeFromCartController,
    updateCartQuantityController
} = require('../controllers/cartController');

const router = express.Router();

// Add item to cart
router.post('/add', requireSignIn, addToCartController);

// Get cart
router.get('/', requireSignIn, getCartController);

// Remove item from cart | DELETE
router.delete('/remove/:productId', requireSignIn, removeFromCartController);

// Update item quantity | PUT
router.put('/update-quantity', requireSignIn, updateCartQuantityController);


module.exports = router; 