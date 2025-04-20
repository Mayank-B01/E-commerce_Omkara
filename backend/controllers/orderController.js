const Order = require('../models/orderModel'); // Assuming order model is imported

// Controller to get all orders (Admin only), optionally filtered by user
const getAllOrdersController = async (req, res) => {
    try {
        const filter = {};

        // Check for userId query parameter for filtering
        if (req.query.userId) {
            // Validate if it's a reasonable ID format if necessary (e.g., ObjectId)
            filter.buyer = req.query.userId; // Filter by the buyer field
        }

        console.log("Fetching orders with filter:", filter);
        
        const orders = await Order.find(filter)
            .populate("products", "-photo") // Populate product details (excluding photo)
            .populate("buyer", "name email") // Populate buyer's name and email
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: `Orders ${req.query.userId ? 'for user ' + req.query.userId : ''} fetched successfully`,
            count: orders.length,
            orders: orders,
        });

    } catch (error) {
        console.log("Error fetching all orders:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching orders",
            error: error.message,
        });
    }
};

// --- Other order controller functions (update status, etc.) ---

// Example: updateOrderStatusController (assuming it exists)
const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } // Return the updated document
        );

        if (!order) {
            return res.status(404).send({ success: false, message: "Order not found" });
        }

        res.status(200).send({
            success: true,
            message: "Order status updated",
            order: order,
        });

    } catch (error) {
        console.log("Error updating order status:", error);
        res.status(500).send({
            success: false,
            message: "Error updating order status",
            error: error.message,
        });
    }
};

// Add other required controllers like getOrderStatsController if they exist in this file
const getOrderStatsController = async (req, res) => {
    try {
        const count = await Order.countDocuments({}); // Example: count all orders
        // Example: calculate revenue (adjust based on your schema/logic)
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Delivered' } }, // Example: only count delivered for revenue
            { $group: { _id: null, totalRevenue: { $sum: '$payment.transaction.amount' } } } 
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.status(200).json({ count, totalRevenue });
    } catch (error) {
        console.log('Error fetching order stats:', error);
        res.status(500).json({ error: 'Failed to fetch order stats' });
    }
};

module.exports = { 
    getAllOrdersController, 
    updateOrderStatusController, 
    getOrderStatsController 
    // Add other exported functions from this file
}; 