const express = require('express');
const router = express.Router();
const FaceRegistration = require('../models/FaceRegistration');
const axios = require('axios');

// Register a new face
router.post('/register', async (req, res) => {
  try {
    const { name, image } = req.body;
    
    if (!name || !image) {
      return res.status(400).json({ error: 'Name and image are required' });
    }

    // Send image to Python service for face encoding
    const pythonServiceResponse = await axios.post('http://localhost:5001/encode', {
      image: image
    });

    if (!pythonServiceResponse.data.encoding) {
      return res.status(400).json({ error: 'No face detected in the image' });
    }

    const registration = new FaceRegistration({
      name,
      faceEncoding: pythonServiceResponse.data.encoding
    });

    await registration.save();
    res.status(201).json({ 
      success: true, 
      message: 'Face registered successfully',
      registration 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register face' });
  }
});

// Get all registered faces
router.get('/registered', async (req, res) => {
  try {
    const registrations = await FaceRegistration.find().sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

module.exports = router; 