import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { 
    Box, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    List, 
    ListItem, 
    ListItemText,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { chatSocket } = useChat();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (chatSocket) {
            chatSocket.on('chat_response', (response) => {
                const messageContent = typeof response === 'string' ? response : response.answer;
                const sources = typeof response === 'string' ? [] : response.sources;
                
                setMessages(prev => [...prev, { 
                    type: 'response', 
                    content: messageContent,
                    sources: sources
                }]);
                setIsLoading(false);
            });

            chatSocket.on('chat_error', (error) => {
                setMessages(prev => [...prev, { type: 'error', content: error.message }]);
                setIsLoading(false);
            });
        }

        return () => {
            if (chatSocket) {
                chatSocket.off('chat_response');
                chatSocket.off('chat_error');
            }
        };
    }, [chatSocket]);

    const handleSend = () => {
        if (!input.trim()) return;

        const message = input.trim();
        setMessages(prev => [...prev, { type: 'user', content: message }]);
        setInput('');
        setIsLoading(true);

        chatSocket.emit('chat_message', { message });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
            <Typography variant="h4" gutterBottom>
                Chat Assistant
            </Typography>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    height: 'calc(100% - 80px)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <List 
                    sx={{ 
                        flexGrow: 1, 
                        overflow: 'auto',
                        mb: 2,
                        '& .MuiListItem-root': {
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            mb: 1
                        }
                    }}
                >
                    {messages.map((msg, index) => (
                        <ListItem 
                            key={index}
                            sx={{
                                backgroundColor: msg.type === 'user' ? '#e3f2fd' : 
                                              msg.type === 'error' ? '#ffebee' : 
                                              '#f5f5f5',
                                borderRadius: 2,
                                maxWidth: '80%',
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ mb: 0.5 }}
                            >
                                {msg.type === 'user' ? 'You' : 'Assistant'}
                            </Typography>
                            <ListItemText 
                                primary={msg.content}
                                secondary={msg.sources && msg.sources.length > 0 && (
                                    <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Sources:</Typography>
                                        {msg.sources.map((source, i) => (
                                            <Typography key={i} variant="caption" display="block">
                                                {source}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                                sx={{ m: 0 }}
                            />
                        </ListItem>
                    ))}
                    {isLoading && (
                        <ListItem sx={{ justifyContent: 'center' }}>
                            <CircularProgress size={20} />
                        </ListItem>
                    )}
                    <div ref={messagesEndRef} />
                </List>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about registered faces..."
                        disabled={isLoading}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        endIcon={<SendIcon />}
                    >
                        Send
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ChatPage; 