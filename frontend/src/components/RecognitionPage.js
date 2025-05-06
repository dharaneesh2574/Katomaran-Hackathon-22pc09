import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Box, Typography, Paper } from '@mui/material';

const RecognitionPage = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const { socket } = useSocket();
    const frameInterval = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (frameInterval.current) {
                clearInterval(frameInterval.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // [1.1] Webcam Initialization
    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                startFrameCapture();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
            if (frameInterval.current) {
                clearInterval(frameInterval.current);
            }
        }
    };

    // [1.2] Frame Capture
    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the frame data
        const frameData = canvas.toDataURL('image/jpeg', 0.8);

        // [1.3] Send to Backend via WebSocket
        socket.emit('frame', { image: frameData });
    };

    const startFrameCapture = () => {
        if (frameInterval.current) {
            clearInterval(frameInterval.current);
        }
        // Capture frame every 500ms
        frameInterval.current = setInterval(captureFrame, 500);
    };

    // [4.1] & [4.2] Handle Recognition Results
    useEffect(() => {
        if (socket) {
            socket.on('recognition_result', (faces) => {
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');

                    // Clear previous drawings
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                    // Draw boxes and names for each recognized face
                    faces.forEach(face => {
                        const { box, name, confidence } = face;
                        
                        // Draw box (green for recognized, red for unknown)
                        context.strokeStyle = name === 'Unknown' ? '#ff0000' : '#00ff00';
                        context.lineWidth = 2;
                        context.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);

                        // Draw name and confidence
                        const text = `${name} (${Math.round(confidence * 100)}%)`;
                        context.fillStyle = name === 'Unknown' ? '#ff0000' : '#00ff00';
                        context.font = '16px Arial';
                        context.fillText(text, box.left, box.top - 5);
                    });
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('recognition_result');
            }
        };
    }, [socket]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Face Recognition
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
                                display: isStreaming ? 'block' : 'none'
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <button
                            onClick={startVideo}
                            disabled={isStreaming}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Start Recognition
                        </button>
                        <button
                            onClick={stopVideo}
                            disabled={!isStreaming}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Stop Recognition
                        </button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default RecognitionPage; 