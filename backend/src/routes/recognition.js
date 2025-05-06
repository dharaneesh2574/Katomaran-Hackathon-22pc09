const express = require('express');
const router = express.Router();
const axios = require('axios');

// [2.1] & [2.2] Handle recognition request and forward to Python service
router.post('/recognize', async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // [2.2] Forward to Python service
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(`${pythonServiceUrl}/recognize`, { image });

        // [2.3] & [2.4] Handle Python response and send back to frontend
        res.json(response.data);
    } catch (error) {
        console.error('Recognition error:', error);
        res.status(500).json({ error: 'Error processing recognition request' });
    }
});

module.exports = router; 