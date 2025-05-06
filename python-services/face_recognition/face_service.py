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
from deepface import DeepFace
import os

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# Store face embeddings in memory (in production, this should be in a database)
known_face_embeddings = []
known_face_names = []

def process_frame(frame_data):
    """Process a frame and return face locations and embeddings."""
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
        
        # Find faces in the frame using DeepFace
        face_objs = DeepFace.extract_faces(frame, enforce_detection=False)
        
        if not face_objs:
            return frame, [], []
            
        face_locations = []
        face_embeddings = []
        
        for face_obj in face_objs:
            face = face_obj['face']
            x, y, w, h = face_obj['facial_area'].values()
            face_locations.append((y, x + w, y + h, x))
            
            # Get face embedding
            embedding = DeepFace.represent(face, model_name="VGG-Face", enforce_detection=False)
            face_embeddings.append(embedding)
        
        return frame, face_locations, face_embeddings
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
        
        frame, face_locations, face_embeddings = process_frame(image_data)
        
        if len(face_embeddings) == 0:
            return web.json_response({'error': 'No face detected in the image'}, status=400)
        
        if len(face_embeddings) > 1:
            return web.json_response({'error': 'Multiple faces detected. Please ensure only one face is in the frame'}, status=400)
        
        return web.json_response({
            'success': True,
            'encoding': face_embeddings[0]
        })
    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def register_face(name, frame_data):
    """Register a new face."""
    frame, face_locations, face_embeddings = process_frame(frame_data)
    
    if len(face_embeddings) == 0:
        return {"error": "No face detected in the image"}
    
    if len(face_embeddings) > 1:
        return {"error": "Multiple faces detected. Please ensure only one face is in the frame"}
    
    # Store the face embedding and name
    known_face_embeddings.append(face_embeddings[0])
    known_face_names.append(name)
    
    return {"success": True, "message": f"Face registered for {name}"}

async def recognize_faces(frame_data):
    """Recognize faces in a frame."""
    frame, face_locations, face_embeddings = process_frame(frame_data)
    
    if frame is None:
        return []
    
    faces = []
    for (top, right, bottom, left), face_embedding in zip(face_locations, face_embeddings):
        # Compare with known faces
        name = "Unknown"
        if known_face_embeddings:
            # Calculate distances to all known faces
            distances = []
            for known_embedding in known_face_embeddings:
                # Calculate cosine similarity
                similarity = np.dot(face_embedding, known_embedding) / (np.linalg.norm(face_embedding) * np.linalg.norm(known_embedding))
                distances.append(1 - similarity)  # Convert to distance
            
            # Find the closest match
            min_distance_idx = np.argmin(distances)
            if distances[min_distance_idx] < 0.3:  # Threshold for recognition
                name = known_face_names[min_distance_idx]
        
        faces.append({
            "name": name,
            "box": {
                "top": top,
                "right": right,
                "bottom": bottom,
                "left": left
            }
        })
    
    return faces

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
    await sio.emit('recognitionResult', faces, room=sid)

# Add routes
app.router.add_post('/encode', encode_face)

if __name__ == '__main__':
    logger.info("Starting face recognition service on port 5001...")
    web.run_app(app, port=5001) 