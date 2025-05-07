import os
import json
import logging
from datetime import datetime
import socketio
from aiohttp import web
import pymongo
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check for OpenAI API key
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Initialize Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# MongoDB connection
try:
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    logger.info(f"Connecting to MongoDB at {mongo_uri}")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client['face-recognition']
    registrations = db['faceregistrations']
    # Test the connection
    db.command('ping')
    logger.info("Successfully connected to MongoDB")
    
    # Check if we have any registrations
    registration_count = registrations.count_documents({})
    logger.info(f"Found {registration_count} registrations in database")
    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Initialize OpenAI components with explicit API key and cost-effective models
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv('OPENAI_API_KEY'),
    model="text-embedding-3-small"  # More cost-effective embedding model
)

llm = ChatOpenAI(
    openai_api_key=os.getenv('OPENAI_API_KEY'),
    model_name="gpt-3.5-turbo",  # Using the correct chat model
    temperature=0,
    max_tokens=150  # Limit response length to reduce costs
)

# Initialize conversation memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    max_token_limit=1000  # Limit memory size to reduce costs
)

def create_qa_chain():
    """Create a new QA chain with updated context."""
    try:
        # Get all registrations
        logger.info("Fetching registrations from database...")
        all_registrations = list(registrations.find())
        registration_count = len(all_registrations)
        logger.info(f"Found {registration_count} registrations")
        
        if registration_count == 0:
            logger.warning("No registrations found in database")
            return {
                "answer": "There are currently no registered users in the system.",
                "error": False
            }
        
        # Sort registrations by date to help with "last registered" queries
        sorted_registrations = sorted(
            all_registrations,
            key=lambda x: x['registeredAt'] if isinstance(x['registeredAt'], datetime) 
            else datetime.fromisoformat(x['registeredAt'].replace('Z', '+00:00')),
            reverse=True
        )
        
        # Create context from registrations with structured information
        context = []
        # Add summary information
        context.append(f"Total number of registered users: {registration_count}")
        if sorted_registrations:
            last_reg = sorted_registrations[0]
            last_reg_date = last_reg['registeredAt']
            if isinstance(last_reg_date, str):
                last_reg_date = datetime.fromisoformat(last_reg_date.replace('Z', '+00:00'))
            context.append(f"Most recent registration: {last_reg['name']} on {last_reg_date.strftime('%Y-%m-%d %H:%M')}")
        
        # Add individual registration details
        for reg in sorted_registrations:
            try:
                reg_date = reg['registeredAt']
                if isinstance(reg_date, str):
                    reg_date = datetime.fromisoformat(reg_date.replace('Z', '+00:00'))
                context.append(
                    f"Registration details - Name: {reg['name']}, "
                    f"Date: {reg_date.strftime('%Y-%m-%d')}, "
                    f"Time: {reg_date.strftime('%H:%M')}"
                )
            except Exception as e:
                logger.error(f"Error processing registration: {e}")
                context.append(f"Registration details - Name: {reg['name']}, Date/Time: Unknown")
        
        logger.info(f"Created context with {len(context)} entries")
        logger.info(f"Context entries: {context}")
        
        # Create vector store with smaller chunk size
        vectorstore = FAISS.from_texts(
            context, 
            embeddings,
            metadatas=[{"source": f"registration_{i}"} for i in range(len(context))]
        )
        
        # Create the prompt template
        template = """You are a helpful assistant that answers questions about user registrations.
        Use the provided context to answer questions accurately and concisely.
        For questions about:
        - Number of users: Always include the total count
        - Last registration: Use the most recent registration information
        - Specific user registration: Provide the exact date and time if available
        Keep your answers clear and to the point.

        Context: {context}
        Question: {question}
        Answer:"""
        
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=template
        )
        
        # Create QA chain with optimized settings
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(
                search_kwargs={"k": 3}  # Limit to top 3 most relevant results
            ),
            memory=memory,
            return_source_documents=False,  # Don't return source documents
            max_tokens_limit=150,  # Limit response length
            combine_docs_chain_kwargs={"prompt": prompt}
        )
        
        logger.info("Successfully created QA chain")
        return qa_chain
    except Exception as e:
        logger.error(f"Error creating QA chain: {e}")
        return {
            "answer": f"Error processing your request: {str(e)}",
            "error": True
        }

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def chat_message(sid, data):
    try:
        message = data.get('message')
        if not message:
            await sio.emit('chat_error', {'message': 'No message provided'}, room=sid)
            return

        # Create new QA chain with latest data
        qa_chain = create_qa_chain()
        
        if isinstance(qa_chain, dict):
            # Handle direct response (no registrations or error)
            await sio.emit('chat_response', qa_chain['answer'], room=sid)
            return
        
        # Get response
        response = qa_chain({"question": message})
        
        # Send only the answer back
        await sio.emit('chat_response', response['answer'], room=sid)
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        await sio.emit('chat_error', {'message': str(e)}, room=sid)

if __name__ == '__main__':
    logger.info("Starting RAG service on port 5002...")
    web.run_app(app, port=5002) 