const mongoose = require('mongoose');

const pendingOrderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

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

            price: { 
                type: Number,
                required: true
            }
        }
    ],

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