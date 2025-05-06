import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

const Registration = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const webcamRef = useRef(null);

  const handleCapture = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!name.trim()) {
        setMessage('Please enter a name');
        return;
      }

      // TODO: Send image to backend for processing
      const response = await fetch('http://localhost:5000/api/face/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          image: imageSrc
        })
      });

      if (response.ok) {
        setMessage('Face registered successfully!');
        setName('');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to register face');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Failed to register face');
    }
  };

  return (
    <div className="registration">
      <h2>Face Registration</h2>
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button onClick={handleCapture}>Register Face</button>
      </div>
      {message && <p className={message.includes('success') ? 'success' : 'error'}>{message}</p>}
    </div>
  );
};

export default Registration; 