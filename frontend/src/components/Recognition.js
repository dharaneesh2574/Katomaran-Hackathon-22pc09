import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';

const Recognition = () => {
  const webcamRef = useRef(null);
  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5000');

    // Listen for recognition results
    socketRef.current.on('recognitionResult', (results) => {
      setRecognizedFaces(results);
    });

    // Start sending frames for recognition
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        socketRef.current.emit('frame', { image: imageSrc });
      }
    }, 500); // Send frame every 500ms

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="recognition">
      <h2>Face Recognition</h2>
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
        />
        {/* Overlay recognized faces */}
        <div className="faces-overlay">
          {recognizedFaces.map((face, index) => (
            <div
              key={index}
              className="face-box"
              style={{
                left: face.box.left,
                top: face.box.top,
                width: face.box.width,
                height: face.box.height
              }}
            >
              <span className="name-tag">{face.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recognition; 