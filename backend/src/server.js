const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const registrationRoutes = require('./routes/registration');
const recognitionRoutes = require('./routes/recognition');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image data

// Routes
app.use('/api/face', registrationRoutes);
app.use('/api/recognition', recognitionRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/face-recognition', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // [2.1] Handle frame data from frontend
  socket.on('frame', async (data) => {
    try {
      // [2.2] Forward to Python service
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
      const response = await axios.post(`${pythonServiceUrl}/recognize`, data);

      // [2.3] & [2.4] Send recognition results back to frontend
      socket.emit('recognition_result', response.data);
    } catch (error) {
      console.error('Recognition error:', error);
      socket.emit('recognition_error', { error: 'Error processing frame' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 