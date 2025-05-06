const mongoose = require('mongoose');

const faceRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  faceEncoding: {
    type: [Number],
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FaceRegistration', faceRegistrationSchema); 