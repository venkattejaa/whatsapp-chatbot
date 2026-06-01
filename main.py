import datetime
from fastapi import FastAPI, Form, Response, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

import db

app = FastAPI(title="WhatsApp Auto-Reply Chatbot API")

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema for simulator
class SimulatorRequest(BaseModel):
    message: str
    phone: str = "+1234567890"

# Request schema for resolving handoffs
class ResolveRequest(BaseModel):
    id: int

# Check if current time is outside working hours
# Expected working hours format: "HH:MM - HH:MM" (e.g., "11:00 - 23:00")
def is_outside_working_hours(hours_str):
    if not hours_str or "-" not in hours_str:
        return False
    try:
        now = datetime.datetime.now().time()
        start_str, end_str = hours_str.split("-")
        
        start_h, start_m = map(int, start_str.strip().split(":"))
        end_h, end_m = map(int, end_str.strip().split(":"))
        
        start_time = datetime.time(start_h, start_m)
        end_time = datetime.time(end_h, end_m)
        
        if start_time <= end_time:
            # Normal range (e.g. 09:00 to 22:00)
            return not (start_time <= now <= end_time)
        else:
            # Spans midnight (e.g. 18:00 to 02:00)
            return not (now >= start_time or now <= end_time)
    except Exception as e:
        print(f"Error parsing working hours '{hours_str}': {e}")
        return False

# core chatbot matching engine
def process_chatbot_logic(message: str, phone: str):
    config = db.load_data()
    
    # Check if bot is disabled globally
    if not config.get("status", True):
        return "⚠️ *Auto-Reply Bot is Offline.*\n\nThe business owner has temporarily disabled automatic replies. Please leave your message, and we will get back to you directly.", False

    msg_clean = message.lower().strip()
    
    # Match keywords
    reply_text = None
    handoff_triggered = False
    
    # Standard Keywords
    if msg_clean in ["menu", "1", "1️⃣"]:
        reply_text = config.get("menu_content", "")
    elif msg_clean in ["price", "prices", "price list", "2", "2️⃣"]:
        reply_text = config.get("price_content", "")
    elif msg_clean in ["location", "address", "maps", "map", "3", "3️⃣"]:
        reply_text = config.get("location_content", "")
    elif msg_clean in ["timing", "timings", "hours", "4", "4️⃣"]:
        reply_text = config.get("timings_content", "")
    elif msg_clean in ["human", "agent", "support", "talk", "5", "5️⃣", "talk to human"]:
        # Hand off to human
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        db.add_handoff(phone, message, now_str)
        reply_text = "🚨 *Talk to Human Request Received!*\n\nI have logged your request and notified the business owner. A human agent will connect with you on this chat shortly. Thank you for your patience! 🙏"
        handoff_triggered = True
    else:
        # Check Custom Keywords
        custom_keywords = config.get("custom_keywords", [])
        for item in custom_keywords:
            kw = item.get("keyword", "").lower().strip()
            if kw and (kw == msg_clean or f" {kw} " in f" {msg_clean} " or msg_clean.startswith(f"{kw} ") or msg_clean.endswith(f" {kw}")):
                reply_text = item.get("response", "")
                break
                
    # Fallback to greeting message
    if not reply_text:
        reply_text = config.get("greeting_message", "")
        
    # Check working hours and append notice if outside working hours
    # Try parsing "11:00-23:00" from timings or a dedicated setting
    # Let's check against a standardized "11:00 - 23:00" or similar in timings string if possible,
    # or just use a standard format "11:00-23:00" in db config
    working_hours_raw = "11:00-23:00" # Default config fallback
    # Check if we can find working hours in the active settings
    # We will support a dedicated working_hours config string like "11:00-23:00"
    working_hours = config.get("working_hours", "11:00-23:00")
    
    if is_outside_working_hours(working_hours):
        off_hours_notice = config.get("off_hours_message", "")
        if off_hours_notice:
            reply_text = f"{reply_text}\n\n⚠️ *[OFF-HOURS NOTICE]*\n{off_hours_notice}"
            
    return reply_text, handoff_triggered


# API: Retrieve configuration
@app.get("/api/config")
def get_configuration():
    return db.get_config()

# API: Save configuration
@app.post("/api/config")
def save_configuration(new_config: dict):
    return db.update_config(new_config)

# API: Fetch all handoff requests
@app.get("/api/handoffs")
def get_handoff_logs():
    return db.get_handoffs()

# API: Resolve a handoff request
@app.post("/api/handoffs/resolve")
def resolve_handoff_log(request: ResolveRequest):
    return db.resolve_handoff(request.id)

# API: Mock Simulator endpoint for dashboard preview
@app.post("/api/simulator")
def post_simulator_message(req: SimulatorRequest):
    reply, handoff = process_chatbot_logic(req.message, req.phone)
    return {
        "response": reply,
        "handoff_triggered": handoff
    }

# Twilio Webhook Receiver
@app.post("/webhook")
async def twilio_webhook(
    From: str = Form(None),
    To: str = Form(None),
    Body: str = Form(None)
):
    # Twilio sends From as "whatsapp:+14155238886"
    sender_phone = From if From else "Unknown"
    incoming_message = Body if Body else ""
    
    # Process chatbot reply
    reply_message, _ = process_chatbot_logic(incoming_message, sender_phone)
    
    # Construct Twilio TwiML XML response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_message}</Message>
</Response>
"""
    return Response(content=twiml_response, media_type="application/xml")


# Mount static files for dashboard (index.html, CSS, JS)
# Create the directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

# Direct root route to index.html if it exists, otherwise return simple welcome page
@app.get("/", response_class=HTMLResponse)
def read_root():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    # Check root directory first (for GitHub Pages structure)
    index_path = os.path.join(root_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    # Fallback to static/index.html
    static_index = os.path.join(root_dir, "static", "index.html")
    if os.path.exists(static_index):
        with open(static_index, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return """
    <html>
        <head><title>WhatsApp Chatbot</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #0f172a; color: white;">
            <h1>SmartBite WhatsApp Chatbot Backend is Running!</h1>
            <p>Static files index.html not found yet. Implement static dashboard to view.</p>
        </body>
    </html>
    """

# We mount static directory under '/static' for assets or index.html resources
app.mount("/static", StaticFiles(directory=static_dir), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
