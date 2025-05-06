# Katomaran Hackathon - Face Recognition Platform: Agile Sprint Plan

**Project Goal:** Build a browser-based face registration and real-time recognition platform with a RAG-powered Q&A interface.


---

## Sprint 1: Project Setup and Basic Infrastructure

## Duration: 1 week

### Goals
- Set up basic project structure
- Implement core face recognition functionality
- Establish communication between services
- Create basic UI for face registration and recognition

### Tasks

#### 1. Project Setup
- [x] Initialize project repository
- [x] Create basic directory structure
- [x] Set up version control
- [x] Create initial README.md

#### 2. Backend Development
- [x] Set up Node.js/Express server
- [x] Implement basic API endpoints
- [x] Set up MongoDB connection
- [x] Create basic data models
- [x] Implement WebSocket server

#### 3. Frontend Development
- [x] Set up React application
- [x] Create basic UI components
- [x] Implement face registration interface
- [x] Implement face recognition interface
- [x] Set up WebSocket client

#### 4. Python Service
- [x] Set up Python environment
- [x] Install face recognition dependencies
- [x] Implement face detection service
- [x] Create WebSocket server for real-time processing

#### 5. Integration
- [x] Connect frontend to backend
- [x] Connect backend to Python service
- [x] Test end-to-end communication
- [x] Implement error handling

### Definition of Done
- [x] All services can communicate with each other
- [x] Face registration works end-to-end
- [x] Face recognition works in real-time
- [x] Basic error handling is implemented
- [x] Code is properly documented
- [x] All tests pass

### Goal Check
- [x] **Goal Check:** Is the basic project structure and inter-service communication pathway established?

---

## Sprint 2: Recognition, RAG Chat & Polish 

**Sprint Goal:** Implement live face recognition, build the RAG-based chat interface, refine the UI/UX, add documentation, and prepare the project for submission.

### Python: Face Recognition Service (Recognition)
- [ ] **Task:** Implement logic to load known face encodings from the database. (`cursor: mark task`)
- [ ] **Task:** Implement face comparison logic (compare detected face encoding against known encodings). (`cursor: mark task`)
- [ ] **Task:** Create function/endpoint that receives a frame, performs detection and recognition, and returns names/bounding boxes for known faces. (`cursor: mark task`)
- [ ] **Task:** Optimize recognition loop (handle multiple faces, consider frame skipping if needed). (`cursor: mark task`)

### Frontend: Live Recognition UI
- [ ] **Task:** Create the `RecognitionPage` component structure. (`cursor: mark task`)
- [ ] **Task:** Implement webcam access and display feed (similar to registration). (`cursor: mark task`)
- [ ] **Task:** Implement periodic API calls from React to Backend to send frames for recognition. (`cursor: mark task`)
- [ ] **Task:** Implement logic to receive bounding box/name data from the backend. (`cursor: mark task`)
- [ ] **Task:** Implement overlay drawing of bounding boxes and names on the video feed. (`cursor: mark task`)

### Backend: WebSocket & RAG Integration
- [ ] **Task:** Implement WebSocket server in Node.js (`/backend/websocket`). (`cursor: mark task`)
- [ ] **Task:** Configure WebSocket connection handling for Frontend clients. (`cursor: mark task`)
- [ ] **Task:** Configure WebSocket connection handling for Python RAG engine client. (`cursor: mark task`)
- [ ] **Task:** Implement message routing: Frontend Query -> RAG Engine -> Frontend Response. (`cursor: mark task`)

### Python: RAG Engine
- [ ] **Task:** Setup Python environment for RAG (`/python-services/rag_engine`). (`cursor: mark task`)
- [ ] **Task:** Install necessary libraries (e.g., `LangChain`, `FAISS`, `openai`, WebSocket client library). (`cursor: mark task`)
- [ ] **Task:** Implement logic to load/access registration data (names, timestamps) from the database. (`cursor: mark task`)
- [ ] **Task:** Create vector embeddings (FAISS index) from the registration data (if using vector search approach). (`cursor: mark task`)
- [ ] **Task:** Implement RAG core logic: retrieve relevant data based on query, format prompt for LLM. (`cursor: mark task`)
- [ ] **Task:** Implement OpenAI API call logic (using provided/personal tokens). (`cursor: mark task`)
- [ ] **Task:** Implement WebSocket client logic to connect to Node.js server and handle query/response flow. (`cursor: mark task`)

### Frontend: Chat Interface
- [ ] **Task:** Create `ChatWidget` component. (`cursor: mark task`)
- [ ] **Task:** Implement WebSocket connection logic in React. (`cursor: mark task`)
- [ ] **Task:** Add UI for displaying chat messages (user queries, RAG responses). (`cursor: mark task`)
- [ ] **Task:** Add UI input field for typing questions. (`cursor: mark task`)
- [ ] **Task:** Implement logic to send user queries over WebSocket. (`cursor: mark task`)
- [ ] **Task:** Implement logic to receive and display RAG responses from WebSocket. (`cursor: mark task`)

### Final Polish & Submission Prep
- [ ] **Task:** Refine UI/UX for a good look and feel. (`cursor: mark task`)
- [ ] **Task:** Implement organized logging across all services. (`cursor: mark task`)
- [ ] **Task:** Create Architecture Diagram (`/docs/architecture.png`). (`cursor: mark task`)
- [ ] **Task:** Write comprehensive `README.md` (setup, assumptions, usage, attribution line). (`cursor: mark task`)
- [ ] **Task:** Record Loom (or similar) demo video and add link to README. (`cursor: mark task`)
- [ ] **Task:** Clean up code, ensure modularity and clear naming. (`cursor: mark task`)
- [ ] **Task:** Final end-to-end testing of all features. (`cursor: mark task`)
- [ ] **Task:** Push final code to public GitHub repository. (`cursor: mark task`)
- [ ] **Task:** Submit repository link via Google Form. (`cursor: mark task`)

### Sprint 2 Review Items
- [ ] **Goal Check:** Can a user see recognized faces with names/boxes on the live feed?
- [ ] **Goal Check:** Can a user ask questions about registration via chat and get LLM-generated answers?
- [ ] **Goal Check:** Is the UI polished and user-friendly?
- [ ] **Goal Check:** Are all submission requirements (README, diagram, video link, logging) met?

---

**Note:** This is an aggressive plan for a hackathon. Be prepared to adapt and prioritize features based on progress. Focus on delivering the core functional modules first. Use AI tools like Cursor effectively to mark off tasks and potentially generate boilerplate code. Good luck!