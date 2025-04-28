const express = require('express');
const { requireSignIn, isAdmin } = require('../middlewares/authMiddleware');
const {
    getAllOrdersController,
    updateOrderStatusController,
    getUserOrdersController, // Import the user-specific controller
    getOrderStatsController // Import the getOrderStatsController
    // getOrderStatsController is likely admin-only, maybe move to a separate admin route later?
} = require('../controllers/orderController');

const router = express.Router();

// --- User Routes ---
router.get('/user-orders', requireSignIn, getUserOrdersController);


// --- Admin Routes ---
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController);

// PUT Update Order Status (Admin)
router.put('/update-status/:orderId', requireSignIn, isAdmin, updateOrderStatusController);

// GET Order Stats (Admin) - Uncomment and activate
router.get('/stats', requireSignIn, isAdmin, getOrderStatsController);

module.exports = router; 