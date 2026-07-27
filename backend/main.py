import os
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import gspread
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

# Load environment variables from .env file
load_dotenv()

GOOGLE_SHEET_NAME = os.getenv("GOOGLE_SHEET_NAME", "UrjaLink Leads")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your-sending-email@gmail.com")
SENDER_APP_PASSWORD = os.getenv("SENDER_APP_PASSWORD", "abcdefghijklmnop")
OWNER_EMAIL = os.getenv("OWNER_EMAIL", "owner-email@urjalink.com")

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
# 2. FASTAPI APPLICATION & CORS SETUP
# ==========================================
app = FastAPI(title="UrjaLink Backend API", version="1.0.0")

# Allow React Vite dev server (ports 5173 / 3000) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 3. GOOGLE SHEETS INTEGRATION (gspread)
# ==========================================
def append_to_google_sheet(lead: ContactLead):
    """
    Appends a new row to the configured Google Sheet via Service Account credentials.
    """
    try:
        # Determine credentials path (looks for credentials.json in backend/ directory)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        creds_path = os.path.join(base_dir, "credentials.json")
        
        if not os.path.exists(creds_path):
            print(f"❌ [SHEETS ERROR] credentials.json not found at {creds_path}")
            return
            
        # Authenticate with Google Sheets API
        gc = gspread.service_account(filename=creds_path)
        
        # Open spreadsheet by title
        sheet = gc.open(GOOGLE_SHEET_NAME).sheet1
        
        # Prepare row data
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
        
        # Append row to Sheet
        sheet.append_row(row)
        print(f"✅ [SHEETS SUCCESS] Successfully appended lead from {lead.name} to '{GOOGLE_SHEET_NAME}'.")
        
    except gspread.exceptions.SpreadsheetNotFound:
        print(f"❌ [SHEETS ERROR] Spreadsheet '{GOOGLE_SHEET_NAME}' not found. Did you share it with the service account email?")
    except Exception as e:
        print(f"❌ [SHEETS ERROR] Failed to append row: {str(e)}")

# ==========================================
# 4. EMAIL NOTIFICATION (SMTP)
# ==========================================
def send_owner_email(lead: ContactLead):
    """
    Sends an instant notification email to the owner using Gmail SMTP + App Password.
    If default placeholders are still present in .env, logs to console instead.
    """
    if "your-sending-email" in SENDER_EMAIL or "abcdefghijklmnop" in SENDER_APP_PASSWORD:
        print(f"ℹ️ [EMAIL SKIP] SMTP credentials not set in .env. Logging inquiry to console:")
        print(f"   📧 To Owner ({OWNER_EMAIL}): New lead from {lead.name} ({lead.phone}) | {lead.location}")
        print(f"   💬 Message: {lead.message}\n")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 New EV Charger Inquiry from {lead.name} ({lead.location})"
        msg["From"] = SENDER_EMAIL
        msg["To"] = OWNER_EMAIL

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0d9488;">⚡ New Lead Received on UrjaLink</h2>
            <p>A new customer has submitted an inquiry via the website get-in-touch form:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Full Name</td><td style="padding: 8px; border: 1px solid #ddd;">{lead.name}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone / WhatsApp</td><td style="padding: 8px; border: 1px solid #ddd;">{lead.phone}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email Address</td><td style="padding: 8px; border: 1px solid #ddd;">{lead.email}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Property Location</td><td style="padding: 8px; border: 1px solid #ddd;">{lead.location}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message / Telemetry</td><td style="padding: 8px; border: 1px solid #ddd;">{lead.message}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #777;">This lead has also been automatically saved to your Google Sheet: <strong>{GOOGLE_SHEET_NAME}</strong>.</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, OWNER_EMAIL, msg.as_string())
            
        print(f"✅ [EMAIL SUCCESS] Notification sent to {OWNER_EMAIL}.")
        
    except Exception as e:
        print(f"❌ [EMAIL ERROR] Failed to send email notification: {str(e)}")

# ==========================================
# 5. API ENDPOINTS
# ==========================================
@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def handle_contact_submission(lead: ContactLead, background_tasks: BackgroundTasks):
    """
    Receives contact form submissions from React frontend.
    Returns 201 Created instantly and processes Sheets & Email in background tasks.
    """
    print(f"\n📨 [NEW SUBMISSION] Received contact payload from: {lead.name} ({lead.location})")
    
    # Dispatch external API calls as background tasks so UI doesn't freeze/wait
    background_tasks.add_task(append_to_google_sheet, lead)
    # background_tasks.add_task(send_owner_email, lead) # PAUSED FOR NOW
    
    return {
        "status": "success",
        "message": f"Inquiry from {lead.name} received successfully.",
        "data": lead
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "UrjaLink Backend API"}
