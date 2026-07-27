import json
import os
from datetime import datetime, timezone
from typing import Optional

import gspread
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

# Load environment variables
load_dotenv()

GOOGLE_SHEET_NAME = os.getenv("GOOGLE_SHEET_NAME", "UrjaLink Leads")

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
app = FastAPI(title="UrjaLink Vercel Serverless API", version="1.0.0")

# Enable CORS for production and development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 3. GOOGLE SHEETS INTEGRATION (gspread)
# ==========================================
def get_gspread_client():
    """
    Authenticates with Google Sheets API.
    In Vercel Production: loads credentials from GOOGLE_SERVICE_ACCOUNT_JSON environment variable.
    In Local Dev: loads from credentials.json file in the api directory.
    """
    env_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if env_json:
        try:
            creds_dict = json.loads(env_json)
            return gspread.service_account_from_dict(creds_dict)
        except Exception as e:
            print(f"❌ [SHEETS ERROR] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env var: {str(e)}")
            return None

    # Fallback to local credentials.json file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    creds_path = os.path.join(base_dir, "credentials.json")
    
    if os.path.exists(creds_path):
        return gspread.service_account(filename=creds_path)
        
    print("❌ [SHEETS ERROR] Neither GOOGLE_SERVICE_ACCOUNT_JSON env var nor credentials.json file found.")
    return None

def append_to_google_sheet(lead: ContactLead) -> bool:
    """
    Appends a new inquiry row to the Google Sheet. Returns True on success, False on failure.
    """
    try:
        gc = get_gspread_client()
        if not gc:
            return False
            
        sheet = gc.open(GOOGLE_SHEET_NAME).sheet1
        
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        row = [
            timestamp,
            lead.name,
            lead.phone,
            lead.email,
            lead.location,
            lead.message,
            "New Inquiry"
        ]
        
        sheet.append_row(row)
        print(f"✅ [SHEETS SUCCESS] Successfully appended lead from {lead.name} to '{GOOGLE_SHEET_NAME}'.")
        return True
        
    except gspread.exceptions.SpreadsheetNotFound:
        print(f"❌ [SHEETS ERROR] Spreadsheet '{GOOGLE_SHEET_NAME}' not found. Did you share it with the service account email?")
        return False
    except Exception as e:
        print(f"❌ [SHEETS ERROR] Failed to append row: {str(e)}")
        return False

# ==========================================
# 4. SERVERLESS API ENDPOINTS
# ==========================================
@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
@app.post("/contact", status_code=status.HTTP_201_CREATED)
@app.post("/", status_code=status.HTTP_201_CREATED)
@app.post("", status_code=status.HTTP_201_CREATED)
def handle_contact_submission(lead: ContactLead):
    """
    Serverless endpoint triggered by React frontend.
    Runs synchronously so Vercel does not freeze the container before writing to Sheets.
    """
    print(f"\n📨 [NEW SUBMISSION] Received contact payload from: {lead.name} ({lead.location})")
    
    # Execute synchronously to guarantee completion before serverless freeze
    success = append_to_google_sheet(lead)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to append row to Google Sheet. Check server logs.")
    
    return {
        "status": "success",
        "message": f"Inquiry from {lead.name} received successfully.",
        "data": lead
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "UrjaLink Vercel Serverless API"}
