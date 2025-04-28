const Order = require('../models/orderModel'); // Assuming order model is imported

const getAllOrdersController = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) {
            filter.buyer = req.query.userId;
        }

        console.log("Fetching orders with filter:", filter);
        
        const orders = await Order.find(filter)
            // Populate nested product details
            .populate({ 
                path: 'products.product', 
                select: 'name price slug' // Select needed product fields
            })
            .populate("buyer", "name email") // Populate buyer
            // .populate("payment") // Populate payment details (Not needed, payment is embedded, not referenced)
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

const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
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


const getOrderStatsController = async (req, res) => {
    try {
        const count = await Order.countDocuments({}); // Get total order count
        
        // Calculate revenue based on orders with successful payment
        const revenueResult = await Order.aggregate([
            { $match: { 'payment.status': 'COMPLETE' } }, // Match orders with successful payment
            { $group: { 
                _id: null, // Group all matched documents together
                totalRevenue: { $sum: '$payment.amount' } // Sum the payment amount field
            } } 
        ]);
        // Extract totalRevenue, default to 0 if no successful orders found
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.status(200).json({ count, totalRevenue });
    } catch (error) {
        console.log('Error fetching order stats:', error);
        res.status(500).json({ error: 'Failed to fetch order stats' });
    }
};

// Get orders for the logged-in user
const getUserOrdersController = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated request

        const orders = await Order.find({ buyer: userId })
            .populate("products.product", "name price photo slug") // Populate product details within the products array
            // .populate("buyer", "name email") // No need to populate buyer, we know who it is
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "User orders fetched successfully",
            count: orders.length,
            orders: orders,
        });

    } catch (error) {
        console.log("Error fetching user orders:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching user orders",
            error: error.message,
        });
    }
};

module.exports = { 
    getAllOrdersController, 
    updateOrderStatusController, 
    getOrderStatsController,
    getUserOrdersController // Export the new controller
}; 