const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');

const processMessage = async (req, res) => {
    // Get projectId and sessionClient inside the function
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

        res.json({
            reply: result.fulfillmentText || 'I am not sure how to respond to that.',
            intent: result.intent.displayName,
            confidence: result.intentDetectionConfidence
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