const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
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
            }
            // Store price at the time of order if prices can change
            // price: { 
            //     type: Number,
            //     required: true
            // }
        }
    ],
    payment: {
        transaction_uuid: { type: String, unique: true }, // From eSewa
        transaction_code: { type: String }, // From eSewa
        amount: { type: Number },
        status: { type: String }, // e.g., 'COMPLETE'
        method: { type: String, default: 'eSewa' }
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    status: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    // Add shipping address details if needed
    // shippingAddress: { ... }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 