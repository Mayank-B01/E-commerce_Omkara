let EsewaPaymentGateway, EsewaCheckStatus, base64Decode;

(async () => {
  const esewa = await import('esewajs');
  EsewaPaymentGateway = esewa.EsewaPaymentGateway;
  EsewaCheckStatus = esewa.EsewaCheckStatus;
  base64Decode = esewa.base64Decode;
})();
const crypto = require('crypto');

const generateSignature = (message, secret) => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64');
};

const EsewaInitiatePayment = async (req, res) => {
    
    const { amount, orderId } = req.body;
    const successUrl = process.env.SUCCESS_URL; 
    const failureUrl = process.env.FAILURE_URL; 

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
            amount, 0, 0, 0, 
            orderId,         
            process.env.MERCHANT_ID,
            process.env.SECRET,
            successUrl,      
            failureUrl,     
            process.env.ESEWAPAYMENT_URL,
            undefined, undefined
        );

        if (!reqPayment || reqPayment.status !== 200 || !reqPayment.request?.res?.responseUrl) {
            console.error("[eSewa Initiate] Error: Failed to initiate payment via EsewaPaymentGateway. Response:", reqPayment);
            return res.status(500).json({ success: false, message: "Error initiating payment with gateway." });
        }

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


const paymentStatus = async (req, res) => {
    
    const { orderId } = req.body;
    console.log(`[eSewa Status Check] Received request for Order ID: ${orderId}`);

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    try {
        const transaction = { amount: 0, status: 'not_found' }; // Placeholder - Replace with DB Query
        if (!transaction || transaction.status === 'not_found') {
            console.warn(`[eSewa Status Check] Transaction not found in DB for Order ID: ${orderId}`);
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        if (transaction.status === 'completed') {
             console.log(`[eSewa Status Check] Transaction ${orderId} already marked completed in DB.`);
            return res.status(200).json({ success: true, status: transaction.status, message: "Transaction already completed." });
        }

        console.log(`[eSewa Status Check] Calling EsewaCheckStatus API for Order ID: ${orderId}, Amount: ${transaction.amount}`);
        const paymentStatusCheck = await EsewaCheckStatus(
            transaction.amount,
            orderId,
            process.env.MERCHANT_ID,
            process.env.ESEWAPAYMENT_STATUS_CHECK_URL
        );

        console.log(`[eSewa Status Check] API Response for ${orderId}:`, paymentStatusCheck);

        if (paymentStatusCheck.status === 200 && paymentStatusCheck.data?.status) {
            const esewaStatus = paymentStatusCheck.data.status;
            console.log(`[eSewa Status Check] eSewa API reported status '${esewaStatus}' for Order ID: ${orderId}`)

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


const handleEsewaSuccessCallback = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let orderId = 'UNKNOWN';

    try {
        console.log("[eSewa Success Callback] Received request. Query:", req.query);
        const { data } = req.query;

        if (!data) {
            console.error("[eSewa Success Callback] Error: 'data' parameter missing.");
            return res.redirect(`${clientUrl}/cart?payment_status=failure&message=InvalidCallbackResponse`);
        }

        let decodedData;
        try {
            decodedData = base64Decode(data);
            console.log("[eSewa Success Callback] Decoded Data:", decodedData);
        } catch (decodeError) {
             console.error("[eSewa Success Callback] Error decoding Base64 data:", decodeError);
             return res.redirect(`${clientUrl}/cart?payment_status=failure&message=InvalidCallbackDataFormat`);
        }

        const { transaction_uuid, status, total_amount, signature: receivedSignature, signed_field_names, transaction_code, product_code } = decodedData;
        orderId = transaction_uuid;

        if (status !== 'COMPLETE') {
            console.warn(`[eSewa Success Callback] Warning: Transaction ${orderId} status is '${status}', not 'COMPLETE'. Treating as failure.`);
            
            return res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=PaymentNotCompleted&status=${status}`);
        }

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

        // let dbErrorOccurred = false;
        // try {
        //     const existingOrder = await Order.findOne({ orderId: orderId });
        //     if (!existingOrder) {
        //          // ... (find buyer, create order logic) ...
        //          // const buyer = await User.findOne(...) // etc.
        //          // const newOrder = new Order({...});
        //          // await newOrder.save();
        //     }
        // } catch (dbError) {
        //      dbErrorOccurred = true;
        //      console.error(`[eSewa Success Callback] CRITICAL: Error saving order ${orderId} to DB:`, dbError);
        // }

        console.log(`[eSewa Success Callback] Redirecting user to frontend HOMEPAGE for order ${orderId}.`);
        if (dbErrorOccurred) {
             res.redirect(`${clientUrl}/?payment_status=success_db_error&orderId=${orderId}`);
        } else {
            res.redirect(`${clientUrl}/?payment_status=success&orderId=${orderId}`);
        }

    } catch (error) {
        console.error("[eSewa Success Callback] Internal Server Error:", error);
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=ServerError`);
    }
};


const handleEsewaFailureCallback = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let orderId = 'UNKNOWN';

    try {
        console.log("[eSewa Failure Callback] Received request. Query:", req.query);
        orderId = req.query.oid || req.query.transaction_uuid || 'UNKNOWN'; 
        const esewaRefId = req.query.refId;
        console.log(`[eSewa Failure Callback] Processing failure for Order ID: ${orderId}, eSewa Ref: ${esewaRefId}`);

        console.log(`[eSewa Failure Callback] Redirecting user to frontend CART page for order ${orderId}.`);
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=PaymentFailedOrCancelled`);

    } catch (error) {
        console.error("[eSewa Failure Callback] Internal Server Error:", error);
        res.redirect(`${clientUrl}/cart?payment_status=failure&orderId=${orderId}&message=ServerError`);
    }
};
module.exports = {
    EsewaInitiatePayment,
    handleEsewaSuccessCallback,
    handleEsewaFailureCallback,
    paymentStatus
};
