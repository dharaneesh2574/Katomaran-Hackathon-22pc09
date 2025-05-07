import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [chatSocket, setChatSocket] = useState(null);

    useEffect(() => {
        // Connect to the chat WebSocket server
        const newSocket = io('http://localhost:5002', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Chat connection error:', error);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        setChatSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <ChatContext.Provider value={{ chatSocket }}>
            {children}
        </ChatContext.Provider>
    );
}; 