import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth';
import { Button, Form, InputGroup } from 'react-bootstrap';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [auth] = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message to chat
        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            const response = await axios.post('http://localhost:8080/api/v1/chatbot/message', {
                message: inputMessage,
                sessionId: auth.user?._id || 'guest' // Use user ID if logged in, 'guest' if not
            });

            // Add bot response to chat
            const botMessage = { text: response.data.reply, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 1000 }}>
            {!isOpen ? (
                <Button
                    variant="primary"
                    onClick={() => setIsOpen(true)}
                    style={{ borderRadius: '50%', width: '4rem', height: '4rem', padding: '0' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chat-fill" viewBox="0 0 16 16">
                        <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7S0 3.134 0 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.56-1.59A6.5 6.5 0 0 0 8 15"/>
                    </svg>
                </Button>
            ) : (
                <div className="bg-white rounded shadow-lg" style={{ width: '24rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <div className="bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Omkara Assistant</h5>
                        <Button
                            variant="link"
                            className="text-white p-0"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </Button>
                    </div>
                    
                    <div className="flex-grow-1 overflow-auto p-3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div
                                    className={`rounded p-2 ${
                                        message.sender === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-light'
                                    }`}
                                    style={{ maxWidth: '80%' }}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <Form onSubmit={handleSendMessage} className="p-3 border-top">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <Button variant="primary" type="submit">
                                Send
                            </Button>
                        </InputGroup>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 