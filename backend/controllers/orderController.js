const Order = require('../models/orderModel'); // Assuming order model is imported

const getAllOrdersController = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) {
            filter.buyer = req.query.userId;
        }

        console.log("Fetching orders with filter:", filter);
        
        const orders = await Order.find(filter)
            .populate("products", "-photo")
            .populate("buyer", "name email")
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
        const count = await Order.countDocuments({}); // Example: count all orders
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
}; 