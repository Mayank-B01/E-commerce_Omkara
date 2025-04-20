const express = require('express');
const { requireSignIn } = require('../middlewares/authMiddleware.js'); // Assuming CommonJS export here
const {
    EsewaInitiatePayment,
    handleEsewaSuccessCallback,
    handleEsewaFailureCallback,
    paymentStatus
} = require('../controllers/esewaController.js'); // Use require

const router = express.Router();

// --- eSewa Payment Initiation ---
// POST /api/v1/esewa/initiate
// Requires user login. Body: { amount: Number, orderId: String }
router.post('/initiate', requireSignIn, EsewaInitiatePayment);

// --- eSewa Callback Handlers (Called by eSewa via Redirect) ---
// GET /api/v1/esewa/callback/success
// Handles verification, DB update, and redirects to frontend success page.
router.get('/callback/success', handleEsewaSuccessCallback);

// GET /api/v1/esewa/callback/failure
// Handles DB update and redirects to frontend failure page.
router.get('/callback/failure', handleEsewaFailureCallback);

// --- eSewa Status Check (Potentially Deprecated / Internal Use) ---
// POST /api/v1/esewa/status
// Body: { orderId: String } // Changed from productId
// Checks status via eSewa API - less secure than verified callback.
router.post('/status', paymentStatus);

module.exports = router; // Use module.exports 