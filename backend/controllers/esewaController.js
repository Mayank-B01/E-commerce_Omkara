const { EsewaPaymentGateway, EsewaCheckStatus, base64Decode } = require('esewajs');
const crypto = require('crypto');

// --- TODO: Create or Import your DB Model ---
// const Transaction = require('../models/transactionModel.js');

// --- Helper: Generate Signature (Manual) ---
// Keep this helper for potential use in callbacks
const generateSignature = (message, secret) => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64');
};

// --- Controller: Initiate Payment ---
const EsewaInitiatePayment = async (req, res) => {
    // Use orderId from frontend, not productId. Amount comes from frontend.
    const { amount, orderId } = req.body;
    const successUrl = process.env.SUCCESS_URL; // Expecting backend callback URL
    const failureUrl = process.env.FAILURE_URL; // Expecting backend callback URL

    console.log(`[eSewa Initiate] Received Order ID: ${orderId}, Amount: ${amount}`);

    // Basic Validation
    if (!amount || !orderId || amount <= 0) {
        console.error("[eSewa Initiate] Error: Invalid amount or orderId.");
        return res.status(400).json({ success: false, message: "Invalid amount or order ID provided." });
    }
    if (!process.env.MERCHANT_ID || !process.env.SECRET || !successUrl || !failureUrl || !process.env.ESEWAPAYMENT_URL) {
        console.error("[eSewa Initiate] Error: Missing required eSewa environment variables.");
        return res.status(500).json({ success: false, message: "Payment gateway configuration error." });
    }

    try {
        console.log(`[eSewa Initiate] Calling EsewaPaymentGateway for Order ID: ${orderId}`);
        console.log(`[eSewa Initiate] SuccessURL: ${successUrl}, FailureURL: ${failureUrl}`);

        const reqPayment = await EsewaPaymentGateway(
            amount, 0, 0, 0, // Amount, Tax, Service Charge, Delivery Charge
            orderId,         // Use the unique orderId from frontend as transaction ID
            process.env.MERCHANT_ID,
            process.env.SECRET,
            successUrl,      // Backend success callback URL
            failureUrl,      // Backend failure callback URL
            process.env.ESEWAPAYMENT_URL,
            undefined, undefined
        );

        if (!reqPayment || reqPayment.status !== 200 || !reqPayment.request?.res?.responseUrl) {
            console.error("[eSewa Initiate] Error: Failed to initiate payment via EsewaPaymentGateway. Response:", reqPayment);
            return res.status(500).json({ success: false, message: "Error initiating payment with gateway." });
        }

        // --- TODO: Create Transaction Record (Consider moving to success callback) ---
        /*
        console.log(`[eSewa Initiate] Saving initial transaction record for Order ID: ${orderId}`);
        const newTransaction = new Transaction({
            orderId: orderId,
            amount: amount,
            status: 'initiated',
        });
        await newTransaction.save();
        console.log(`[eSewa Initiate] Transaction ${orderId} saved with status 'initiated'.`);
        */
        // --- End TODO ---

        console.log(`[eSewa Initiate] Success! Redirecting user to eSewa for Order ID: ${orderId}`);
        return res.status(200).send({
            success: true,
            message: "Redirect URL generated.",
            url: reqPayment.request.res.responseUrl,
        });

    } catch (error) {
        console.error(`[eSewa Initiate] Error during payment initiation for Order ID ${orderId}:`, error);
        return res.status(500).json({ success: false, message: "Internal server error during payment initiation." });
    }
};

// --- Controller: Check Payment Status (Manual Check - Use Callbacks Primarily) ---
const paymentStatus = async (req, res) => {
    // Expect orderId in request body now
    const { orderId } = req.body;
    console.log(`[eSewa Status Check] Received request for Order ID: ${orderId}`);

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    try {
        // --- TODO: Find transaction in DB by orderId to get the amount ---
        // const transaction = await Transaction.findOne({ orderId: orderId });
        const transaction = { amount: 0, status: 'not_found' }; // Placeholder - Replace with DB Query
        // --- End TODO ---

        if (!transaction || transaction.status === 'not_found') {
            console.warn(`[eSewa Status Check] Transaction not found in DB for Order ID: ${orderId}`);
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        // Optional: If already completed via callback, return early
        if (transaction.status === 'completed') {
             console.log(`[eSewa Status Check] Transaction ${orderId} already marked completed in DB.`);
            return res.status(200).json({ success: true, status: transaction.status, message: "Transaction already completed." });
        }

        console.log(`[eSewa Status Check] Calling EsewaCheckStatus API for Order ID: ${orderId}, Amount: ${transaction.amount}`);
        const paymentStatusCheck = await EsewaCheckStatus(
            transaction.amount, // Use amount from YOUR DB record
            orderId,            // Use the orderId
            process.env.MERCHANT_ID,
            process.env.ESEWAPAYMENT_STATUS_CHECK_URL
        );

        console.log(`[eSewa Status Check] API Response for ${orderId}:`, paymentStatusCheck);

        if (paymentStatusCheck.status === 200 && paymentStatusCheck.data?.status) {
            const esewaStatus = paymentStatusCheck.data.status;
            console.log(`[eSewa Status Check] eSewa API reported status '${esewaStatus}' for Order ID: ${orderId}`);

            // --- TODO: Update DB transaction status based on this check (Use with caution) ---
            // Only update if you trust this flow more than the callback, or as a fallback.
            /*
            const dbStatus = esewaStatus === 'COMPLETE' ? 'completed' : 'failed';
            await Transaction.findOneAndUpdate({ orderId: orderId }, { status: dbStatus }, { new: true });
            console.log(`[eSewa Status Check] DB status updated to '${dbStatus}' for Order ID: ${orderId}`);
            */
            // --- End TODO ---

            res.status(200).json({
                success: true,
                status: esewaStatus,
                message: "Transaction status retrieved successfully."
            });
        } else {
            console.error(`[eSewa Status Check] Failed to get valid status from eSewa API for Order ID ${orderId}. Response:`, paymentStatusCheck);
            res.status(500).json({ success: false, message: "Failed to verify payment status with gateway." });
        }
    } catch (error) {
        console.error(`[eSewa Status Check] Error updating transaction status for Order ID ${orderId}:`, error);
        res.status(500).json({ success: false, message: "Server error during status check.", error: error.message });
    }
};

// --- Controller: Handle SUCCESS Callback (Called by eSewa) ---
const handleEsewaSuccessCallback = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let orderId = 'UNKNOWN';

    try {
        console.log("[eSewa Success Callback] Received request. Query:", req.query);
        const { data } = req.query;

        if (!data) {
            console.error("[eSewa Success Callback] Error: 'data' parameter missing.");
            // Redirect to CART on failure
            return res.redirect(`${clientUrl}/cart?payment_status=failure&message=InvalidCallbackResponse`);
        }

        // 1. Decode Data
        let decodedData;
        try {
            decodedData = base64Decode(data);
            console.log("[eSewa Success Callback] Decoded Data:", decodedData);
        } catch (decodeError) {
             console.error("[eSewa Success Callback] Error decoding Base64 data:", decodeError);
             // Redirect to CART on failure
             return res.redirect(`${clientUrl}/cart?payment_status=failure&message=InvalidCallbackDataFormat`);
        }

        const { transaction_uuid, status, total_amount, signature: receivedSignature, signed_field_names, transaction_code, product_code } = decodedData;
        orderId = transaction_uuid;

        // 2. Basic Status Check
        if (status !== 'COMPLETE') {
            console.warn(`[eSewa Success Callback] Warning: Transaction ${orderId} status is '${status}', not 'COMPLETE'. Treating as failure.`);
             // Redirect to CART on failure
            return res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=PaymentNotCompleted&status=${status}`);
        }

        // 3. --- CRITICAL: Signature Verification ---
        const verification_string = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
        const calculatedSignature = generateSignature(verification_string, process.env.SECRET);

        console.log("[eSewa Success Callback] Verification String:", verification_string);
        console.log("[eSewa Success Callback] Received Signature:", receivedSignature);
        console.log("[eSewa Success Callback] Calculated Signature:", calculatedSignature);

        if (calculatedSignature !== receivedSignature) {
            console.error(`[eSewa Success Callback] Error: Signature verification FAILED for order ${orderId}!`);
             // Redirect to CART on failure
            return res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=SignatureMismatch`);
        }

        console.log(`[eSewa Success Callback] Signature verified successfully for order ${orderId}.`);

        // --- (Optional) Server-to-Server Verification (ensure it also redirects to /cart on failure) --- 
        /* ... */

        // 4. --- Create Order in Database --- 
        // ... (DB logic as before) ...
        let dbErrorOccurred = false;
        try {
            const existingOrder = await Order.findOne({ orderId: orderId });
            if (!existingOrder) {
                 // ... (find buyer, create order logic) ...
                 // const buyer = await User.findOne(...) // etc.
                 // const newOrder = new Order({...});
                 // await newOrder.save();
            }
        } catch (dbError) {
             dbErrorOccurred = true;
             console.error(`[eSewa Success Callback] CRITICAL: Error saving order ${orderId} to DB:`, dbError);
        }

        // 5. Redirect to Frontend HOMEPAGE with appropriate status
        console.log(`[eSewa Success Callback] Redirecting user to frontend HOMEPAGE for order ${orderId}.`);
        if (dbErrorOccurred) {
             res.redirect(`${clientUrl}/?payment_status=success_db_error&orderId=${orderId}`);
        } else {
            res.redirect(`${clientUrl}/?payment_status=success&orderId=${orderId}`);
        }

    } catch (error) { // Catches major errors in success callback
        console.error("[eSewa Success Callback] Internal Server Error:", error);
         // Redirect to CART on failure
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=ServerError`);
    }
};

// --- Controller: Handle FAILURE Callback (Called by eSewa) --- 
const handleEsewaFailureCallback = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let orderId = 'UNKNOWN';

    try {
        console.log("[eSewa Failure Callback] Received request. Query:", req.query);
        orderId = req.query.oid || req.query.transaction_uuid || 'UNKNOWN'; 
        const esewaRefId = req.query.refId;
        console.log(`[eSewa Failure Callback] Processing failure for Order ID: ${orderId}, eSewa Ref: ${esewaRefId}`);

        // --- TODO: Update DB status to 'failed' if needed --- 
        /* ... */
        // --- End TODO --- 

        // Redirect to Frontend CART Page with Failure Flags
        console.log(`[eSewa Failure Callback] Redirecting user to frontend CART page for order ${orderId}.`);
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=PaymentFailedOrCancelled`); // Point to /cart

    } catch (error) {
        console.error("[eSewa Failure Callback] Internal Server Error:", error);
        // Redirect to CART even on server error in failure callback
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=ServerError`); // Point to /cart
    }
};

// Export all functions using module.exports
module.exports = {
    EsewaInitiatePayment,
    handleEsewaSuccessCallback,
    handleEsewaFailureCallback,
    paymentStatus
};
