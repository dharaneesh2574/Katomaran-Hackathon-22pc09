import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import socketio
import json
import asyncio
import aiohttp
from aiohttp import web
import logging
import face_recognition
import os
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# Store known face encodings and names
known_face_encodings = []
known_face_names = []

def process_frame(frame_data):
    """Process a frame and return face locations and encodings."""
    try:
        # Remove data URL prefix if present
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(frame_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB
        image = image.convert('RGB')
        
        # Convert to numpy array
        frame = np.array(image)
        
        # Find faces in the frame using face_recognition
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)
        
        return frame, face_locations, face_encodings
    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        return None, [], []

async def encode_face(request):
    """Handle face encoding request."""
    try:
        data = await request.json()
        image_data = data.get('image')
        
        if not image_data:
            return web.json_response({'error': 'No image provided'}, status=400)
        
        frame, face_locations, face_encodings = process_frame(image_data)
        
        if len(face_encodings) == 0:
            return web.json_response({'error': 'No face detected in the image'}, status=400)
        
        if len(face_encodings) > 1:
            return web.json_response({'error': 'Multiple faces detected. Please ensure only one face is in the frame'}, status=400)
        
        # Get facial area information
        top, right, bottom, left = face_locations[0]
        facial_area = {
            'x': int(left),
            'y': int(top),
            'w': int(right - left),
            'h': int(bottom - top),
            'left_eye': None,
            'right_eye': None
        }
        
        # Convert face encoding to list of floats
        face_encoding = face_encodings[0].tolist()
        
        return web.json_response({
            'success': True,
            'encoding': face_encoding,
            'facial_area': facial_area,
            'face_confidence': 1.0
        })
    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def recognize_faces(frame_data):
    """Recognize faces in a frame."""
    try:
        frame, face_locations, face_encodings = process_frame(frame_data)
        
        if frame is None or not face_encodings:
            return []
        
        recognized_faces = []
        
        for face_encoding, face_location in zip(face_encodings, face_locations):
            # Compare with known faces
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
            name = "Unknown"
            
            if True in matches:
                # Find the best match
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]
            
            # Get face location
            top, right, bottom, left = face_location
            
            recognized_faces.append({
                "name": name,
                "box": {
                    "top": int(top),
                    "right": int(right),
                    "bottom": int(bottom),
                    "left": int(left)
                },
                "confidence": float(1 - min(face_distances) if True in matches else 0)
            })
        
        return recognized_faces
    except Exception as e:
        logger.error(f"Error recognizing faces: {e}")
        return []

async def register_face(name, frame_data):
    """Register a new face."""
    try:
        frame, face_locations, face_encodings = process_frame(frame_data)
        
        if len(face_encodings) == 0:
            return {"error": "No face detected in the image"}
        
        if len(face_encodings) > 1:
            return {"error": "Multiple faces detected. Please ensure only one face is in the frame"}
        
        # Store the face encoding and name
        known_face_encodings.append(face_encodings[0])
        known_face_names.append(name)
        
        return {
            "success": True,
            "message": f"Face registered for {name}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error registering face: {e}")
        return {"error": str(e)}

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def register(sid, data):
    result = await register_face(data['name'], data['image'])
    await sio.emit('registration_result', result, room=sid)

@sio.event
async def frame(sid, data):
    faces = await recognize_faces(data['image'])
    await sio.emit('recognition_result', faces, room=sid)

# Add routes
app.router.add_post('/encode', encode_face)

if __name__ == '__main__':
    logger.info("Starting face recognition service on port 5001...")
    web.run_app(app, port=5001) 