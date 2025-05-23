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

const getPaymentMethodsInfo = (paymentType) => {
    const allPaymentMethods = {
        "esewa": "Yes, we accept eSewa payments. You can pay using eSewa during checkout.",
        "cash on delivery": "Yes, we offer cash on delivery for orders within Kathmandu Valley."
    };

    if (paymentType) {
        const method = paymentType.toLowerCase();
        return allPaymentMethods[method] || "We accept various payment methods including eSewa, cash on delivery, bank transfer, credit cards, and debit cards.";
    }

    return "We currently accept e-Sewa only at the moment.\n" ;
};

const getSupportContactInfo = (issueType) => {
    const supportInfo = {
        "order": "For order-related issues, please contact our order support team:\n" +
                "- Phone: +977-1234567890\n" +
                "- Email: orders@omkara.com\n" +
                "- Hours: 9 AM - 6 PM, Monday to Saturday",
        "product": "For product-related queries, please contact our product support:\n" +
                  "- Phone: +977-1234567891\n" +
                  "- Email: products@omkara.com\n" +
                  "- Hours: 9 AM - 6 PM, Monday to Saturday",
        "payment": "For payment-related issues, please contact our payment support:\n" +
                  "- Phone: +977-1234567892\n" +
                  "- Email: payments@omkara.com\n" +
                  "- Hours: 9 AM - 6 PM, Monday to Saturday",
        "delivery": "For delivery-related queries, please contact our delivery team:\n" +
                   "- Phone: +977-1234567893\n" +
                   "- Email: delivery@omkara.com\n" +
                   "- Hours: 9 AM - 6 PM, Monday to Saturday",
        "return": "For return-related issues, please contact our returns department:\n" +
                 "- Phone: +977-1234567894\n" +
                 "- Email: returns@omkara.com\n" +
                 "- Hours: 9 AM - 6 PM, Monday to Saturday",
        "general": "For general inquiries, please contact our customer service:\n" +
                  "- Phone: +977-1234567895\n" +
                  "- Email: support@omkara.com\n" +
                  "- Hours: 9 AM - 6 PM, Monday to Saturday"
    };

    if (issueType) {
        return supportInfo[issueType.toLowerCase()] || 
               "Please contact our customer service:\n" +
               "- Phone: +977-1234567895\n" +
               "- Email: support@omkara.com\n" +
               "- Hours: 9 AM - 6 PM, Monday to Saturday";
    }

    return "You can reach our customer support through:\n" +
           "- Phone: +977-1234567895\n" +
           "- Email: support@omkara.com\n" +
           "- Live Chat: Available on our website\n" +
           "- Store Visit: Visit our physical stores in Hadigaun or Patan\n\n" +
           "Support Hours: 9 AM - 6 PM, Monday to Saturday\n" +
           "For urgent matters, please call our support line.";
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
        
        switch (result.intent.displayName) {
            case 'product.information':
                if (result.parameters.fields.product_name) {
                    reply = await getProductInfo(result.parameters.fields.product_name.stringValue);
                }
                break;
            
            case 'order.tracking':
                if (result.parameters.fields.order_id) {
                    reply = await getOrderStatus(result.parameters.fields.order_id.stringValue);
                }
                break;
            
            case 'product.availability':
                if (result.parameters.fields.product_name) {
                    reply = await checkProductAvailability(result.parameters.fields.product_name.stringValue);
                }
                break;
            
            case 'payment.methods':
                const paymentType = result.parameters.fields.payment_type?.stringValue;
                reply = getPaymentMethodsInfo(paymentType);
                break;
            
            case 'support.contact':
                const issueType = result.parameters.fields.issue_type?.stringValue;
                break;
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