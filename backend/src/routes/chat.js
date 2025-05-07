const express = require('express');
const router = express.Router();
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

// Initialize Socket.IO client for RAG service
const ragClient = Client('http://localhost:5002');

// Initialize Socket.IO server for frontend
const io = new Server();

// Handle frontend connections
io.on('connection', (socket) => {
    console.log('Frontend client connected:', socket.id);

    // Handle chat messages from frontend
    socket.on('chat_message', async (data) => {
        try {
            // Forward message to RAG service
            ragClient.emit('chat_message', data);

            // Listen for response from RAG service
            ragClient.once('chat_response', (response) => {
                socket.emit('chat_response', response);
            });

            // Listen for errors from RAG service
            ragClient.once('chat_error', (error) => {
                socket.emit('chat_error', error);
            });
        } catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('chat_error', { message: 'Error processing your message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Frontend client disconnected:', socket.id);
    });
});

// Attach Socket.IO server to Express app
const attachSocketIO = (server) => {
    io.attach(server);
};

module.exports = { router, attachSocketIO }; 