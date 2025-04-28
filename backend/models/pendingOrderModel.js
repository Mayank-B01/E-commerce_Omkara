const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({
    // Unique ID generated before sending to eSewa (e.g., OMK-timestamp-userId)
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true, // Index for faster lookup
    },
    // Array of items selected for this specific transaction
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: false
            },
            // Store price verified from DB during initiation
            price: { 
                type: Number,
                required: true
            }
        }
    ],
     // Link to the user making the purchase
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    // TTL index: Automatically delete documents after 1 hour (3600 seconds)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, 
    },
});

module.exports = mongoose.model('PendingOrder', pendingOrderSchema); 