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

        }
    ],
    payment: {
        transaction_uuid: { type: String, unique: true },
        transaction_code: { type: String },
        amount: { type: Number },
        status: { type: String },
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