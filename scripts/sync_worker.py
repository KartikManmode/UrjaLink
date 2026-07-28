import os
import json
from datetime import datetime, timezone

import gspread
from pymongo import MongoClient

# Load environment variables (provided by GitHub Actions Secrets)
MONGODB_URI = os.environ.get("MONGODB_URI")
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
GOOGLE_SHEET_NAME = os.environ.get("GOOGLE_SHEET_NAME", "UrjaLink Leads")

def main():
    if not MONGODB_URI or not GOOGLE_SERVICE_ACCOUNT_JSON:
        print("❌ Missing required environment variables. Ensure Secrets are set in GitHub Actions.")
        return

    print("🔌 Connecting to MongoDB...")
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client["urjalink"]
    collection = db["leads"]

    # 1. Find all leads that haven't been synced yet
    pending_leads = list(collection.find({"sync_status": "pending"}))
    
    if not pending_leads:
        print("✅ No pending leads to sync. Exiting.")
        return
        
    print(f"📨 Found {len(pending_leads)} pending leads. Connecting to Google Sheets...")

    # 2. Authenticate with Google Sheets
    try:
        clean_json = GOOGLE_SERVICE_ACCOUNT_JSON.strip()
        if (clean_json.startswith("'") and clean_json.endswith("'")) or (clean_json.startswith('"') and clean_json.endswith('"')):
            clean_json = clean_json[1:-1]
            
        creds_dict = json.loads(clean_json, strict=False)
        if "private_key" in creds_dict and "\\n" in creds_dict["private_key"]:
            creds_dict["private_key"] = creds_dict["private_key"].replace("\\n", "\n")
            
        gc = gspread.service_account_from_dict(creds_dict)
        sheet = gc.open(GOOGLE_SHEET_NAME).sheet1
    except Exception as e:
        print(f"❌ Failed to connect to Google Sheets: {e}")
        print("⏸️  Leaving leads as 'pending' for the next cron run.")
        return

    # 3. Process each lead
    success_count = 0
    for lead in pending_leads:
        try:
            # Prepare the row
            row = [
                lead.get("timestamp", datetime.now(timezone.utc).isoformat()),
                lead.get("name", "N/A"),
                lead.get("phone", "N/A"),
                lead.get("email", "N/A"),
                lead.get("location", "N/A"),
                lead.get("message", "N/A"),
                "New Inquiry"
            ]
            
            # Append to Google Sheets
            sheet.append_row(row)
            
            # 4. Mark as synced in MongoDB
            collection.update_one(
                {"_id": lead["_id"]},
                {"$set": {"sync_status": "synced", "synced_at": datetime.now(timezone.utc).isoformat()}}
            )
            print(f"✅ Synced lead from {lead.get('name')}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Failed to sync lead {lead.get('_id')}: {e}")
            # We explicitly DO NOT change sync_status so it acts as a stack and retries next time!

    print(f"🎉 Sync complete. Successfully synced {success_count}/{len(pending_leads)} leads.")

if __name__ == "__main__":
    main()
