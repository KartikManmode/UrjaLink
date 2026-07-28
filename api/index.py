import os
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Load environment variables
load_dotenv()

# ==========================================
# 1. PYDANTIC MODEL (DATA VALIDATION)
# ==========================================
class ContactLead(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=25)
    email: EmailStr
    location: str = Field(..., min_length=2, max_length=100)
    message: Optional[str] = Field(default="No message provided.", max_length=3000)

# ==========================================
# 2. FASTAPI APPLICATION FOR VERCEL
# ==========================================
app = FastAPI(title="UrjaLink Vercel API - MongoDB Integration", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 3. MONGODB INTEGRATION
# ==========================================
# Initialize MongoDB client at module level to reuse connection pool in Vercel
MONGO_URI = os.getenv("MONGODB_URI")
mongo_client = MongoClient(MONGO_URI) if MONGO_URI else None

def insert_to_mongodb(lead: ContactLead) -> bool:
    """
    Inserts the validated lead into MongoDB Atlas.
    Adds a sync_status field for the GitHub Actions worker to process later.
    """
    if not mongo_client:
        print("❌ [MONGO ERROR] MONGODB_URI environment variable is missing.")
        return False
        
    try:
        # Connect to 'urjalink' database and 'leads' collection
        db = mongo_client["urjalink"]
        collection = db["leads"]
        
        # Convert pydantic model to dict
        lead_doc = lead.model_dump()
        
        # Add metadata for the worker pipeline
        lead_doc["timestamp"] = datetime.now(timezone.utc).isoformat()
        lead_doc["sync_status"] = "pending"  # The worker will look for this!
        
        collection.insert_one(lead_doc)
        print(f"✅ [MONGO SUCCESS] Successfully inserted lead from {lead.name} into MongoDB.")
        return True
    except PyMongoError as e:
        print(f"❌ [MONGO ERROR] Failed to insert row: {str(e)}")
        return False

# ==========================================
# 4. SERVERLESS API ENDPOINTS
# ==========================================
@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
@app.post("/contact", status_code=status.HTTP_201_CREATED)
@app.post("/", status_code=status.HTTP_201_CREATED)
@app.post("", status_code=status.HTTP_201_CREATED)
def handle_contact_submission(lead: ContactLead):
    print(f"\n📨 [NEW SUBMISSION] Received contact payload from: {lead.name} ({lead.location})")
    
    success = insert_to_mongodb(lead)
    if not success:
        raise HTTPException(status_code=500, detail="Database Error: Failed to insert lead into MongoDB.")
    
    return {
        "status": "success",
        "message": f"Inquiry from {lead.name} received successfully.",
        "data": lead
    }

@app.get("/api/health")
@app.get("/health")
@app.get("/")
def health_check():
    return {"status": "ok", "service": "UrjaLink Vercel Serverless API (MongoDB)"}
