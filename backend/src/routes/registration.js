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

    if (!pythonServiceResponse.data.success) {
      return res.status(400).json({ error: pythonServiceResponse.data.error || 'Failed to encode face' });
    }

    const registration = new FaceRegistration({
      name,
      faceEncoding: pythonServiceResponse.data.encoding,
      registeredAt: new Date()
    });

    await registration.save();
    res.status(201).json({ 
      success: true, 
      message: 'Face registered successfully',
      registration: {
        name: registration.name,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response?.data?.error) {
      return res.status(400).json({ error: error.response.data.error });
    }
    res.status(500).json({ error: 'Failed to register face' });
  }
});

// Get all users with their face encodings
router.get('/allUsers', async (req, res) => {
  try {
    const users = await FaceRegistration.find()
      .select('name faceEncoding')
      .lean();

    const formattedUsers = users.map(user => ({
      name: user.name,
      encoding: user.faceEncoding
    }));

    res.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

