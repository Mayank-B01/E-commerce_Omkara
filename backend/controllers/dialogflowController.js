const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');
const productModel = require('../models/productModel');
const Order = require('../models/orderModel');

const getProductInfo = async (productName) => {
    const product = await productModel.findOne({
        $or: [
            { name: { $regex: productName, $options: 'i' } },
            { slug: { $regex: productName, $options: 'i' } }
        ]
    }).select('-photos');
    
    if (!product) {
        return "I couldn't find that product. Could you please check the name and try again?";
    }
    
    return `Here are the details for ${product.name}:
    - Price: Rs. ${product.price}
    - Description: ${product.description}
    - Available Sizes: ${product.sizes.join(', ')}
    - Available Colors: ${product.colors.join(', ')}
    - In Stock: ${product.quantity > 0 ? 'Yes' : 'No'}`;
};

const getOrderStatus = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('products.product', 'name')
        .populate('buyer', 'name');
    
    if (!order) {
        return "I couldn't find that order. Please check the order ID and try again.";
    }
    
    return `Order ${orderId} status:
    - Status: ${order.status}
    - Products: ${order.products.map(p => p.product.name).join(', ')}
    - Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    - Payment Status: ${order.payment.status}`;
};

const checkProductAvailability = async (productName) => {
    const product = await productModel.findOne({
        $or: [
            { name: { $regex: productName, $options: 'i' } },
            { slug: { $regex: productName, $options: 'i' } }
        ]
    });
    
    if (!product) {
        return "I couldn't find that product. Could you please check the name and try again?";
    }
    
    if (product.quantity > 0) {
        return `Yes, ${product.name} is in stock. We have ${product.quantity} units available.`;
    } else {
        return `Sorry, ${product.name} is currently out of stock.`;
    }
};

const processMessage = async (req, res) => {
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    if (!projectId) {
        console.error('DIALOGFLOW_PROJECT_ID is not set in environment variables');
        return res.status(500).json({ error: 'Dialogflow project ID is not configured' });
    }

    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: path.join(__dirname, '../chat-config/fyp-omkara-98381c9be342.json')
    });

    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'en-US',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        
        // Handle parameters based on intent
        let reply = result.fulfillmentText;
        
        if (result.intent.displayName === 'product.information' && result.parameters.fields.product_name) {
            reply = await getProductInfo(result.parameters.fields.product_name.stringValue);
        }
        else if (result.intent.displayName === 'order.tracking' && result.parameters.fields.order_id) {
            reply = await getOrderStatus(result.parameters.fields.order_id.stringValue);
        }
        else if (result.intent.displayName === 'product.availability' && result.parameters.fields.product_name) {
            reply = await checkProductAvailability(result.parameters.fields.product_name.stringValue);
        }

        res.json({
            reply: reply || 'I am not sure how to respond to that.',
            intent: result.intent.displayName,
            confidence: result.intentDetectionConfidence,
            parameters: result.parameters.fields
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            error: 'Error processing message',
            details: error.message
        });
    }
};

module.exports = {
    processMessage
}; 