# Face Recognition and Chat System

A full-stack application that combines face recognition technology with a chat interface for querying registration information. The system uses React for the frontend, Node.js for the backend, and Python for face recognition and RAG (Retrieval-Augmented Generation) services.

## Project Structure

```
.
├── frontend/               # React frontend application
├── backend/               # Node.js backend server
└── python-services/       # Python services
    ├── face_recognition/  # Face recognition service
    └── rag_service/      # RAG service for chat
```

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB
- npm or yarn

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Katomaran-Hackathon-22pc09
```

2. Set up environment variables:

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/face-recognition
```

Python Services (.env):
```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://localhost:27017/face-recognition
```

## Installation

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
cd backend
npm install
```

### Python Services Setup
```bash
cd python-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the Python Services:
```bash
# Terminal 1 - Face Recognition Service
cd python-services/face_recognition
python face_recognition_service.py

# Terminal 2 - RAG Service
cd python-services/rag_service
python rag_service.py
```

3. Start the Backend:
```bash
cd backend
npm start
```

4. Start the Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Face Recognition Service: http://localhost:5001
- RAG Service: http://localhost:5002

## Features

1. Face Registration
   - Upload and register faces
   - Store registration data in MongoDB
   - Real-time face detection

2. Chat Interface
   - Query registration information
   - Get real-time responses
   - View registration history

3. RAG Integration
   - Natural language processing
   - Context-aware responses
   - Registration data retrieval

## API Endpoints

### Backend API
- `POST /api/register` - Register a new face
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get specific registration

### Face Recognition Service
- `POST /api/detect` - Detect faces in an image
- `POST /api/register` - Register a new face

### RAG Service
- WebSocket connection for chat
- Real-time query processing
- Context-aware responses

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 