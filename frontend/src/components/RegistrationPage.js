import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Box, Typography, Paper, TextField, Button, Alert } from '@mui/material';

const RegistrationPage = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { socket } = useSocket();
    const streamInterval = useRef(null);

    useEffect(() => {
        return () => {
            if (streamInterval.current) {
                clearInterval(streamInterval.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setError('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get the frame data
            const frameData = canvas.toDataURL('image/jpeg');

            return frameData;
        }
        return null;
    };

    const handleRegister = () => {
        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }

        const frameData = captureFrame();
        if (!frameData) {
            setError('Failed to capture frame');
            return;
        }

        socket.emit('register', {
            name: name.trim(),
            image: frameData
        });
    };

    useEffect(() => {
        if (socket) {
            socket.on('registration_result', (result) => {
                if (result.error) {
                    setError(result.error);
                    setSuccess('');
                } else {
                    setSuccess(result.message);
                    setError('');
                    setName('');
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('registration_result');
            }
        };
    }, [socket]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Face Registration
            </Typography>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: '100%', maxWidth: 640 }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', display: isStreaming ? 'block' : 'none' }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                display: 'none'
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 640 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isStreaming}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRegister}
                            disabled={!isStreaming || !name.trim()}
                        >
                            Register Face
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={startVideo}
                            disabled={isStreaming}
                        >
                            Start Camera
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={stopVideo}
                            disabled={!isStreaming}
                        >
                            Stop Camera
                        </Button>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 640 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ width: '100%', maxWidth: 640 }}>
                            {success}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RegistrationPage; 