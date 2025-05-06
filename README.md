# Face Recognition Platform

A browser-based face registration and real-time recognition platform with a RAG-powered Q&A interface.

## Features

- Face Registration with Name Association
- Real-time Face Recognition
- WebSocket-based Communication
- Modern React UI
- MongoDB Integration

## Project Structure

```
.
├── backend/               # Node.js Express Server
├── frontend/             # React Frontend
├── python-services/      # Python Face Recognition Service
└── docs/                 # Documentation
```

## Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB
- CMake (for dlib installation)

## Setup Instructions

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up Python environment:
   ```bash
   cd python-services/face_recognition
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/face-recognition
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

## Running the Application

1. Start MongoDB:
   ```bash
   mongod
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

3. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

4. Start the Python face recognition service:
   ```bash
   cd python-services/face_recognition
   source venv/bin/activate
   python face_service.py
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Face Recognition Service: http://localhost:5001

## Usage

1. Navigate to the Registration tab
2. Enter a name and click "Register Face" to capture and store a face
3. Switch to the Recognition tab to see real-time face recognition
4. Recognized faces will be highlighted with bounding boxes and names

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 