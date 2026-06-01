# SmartBite AI — WhatsApp Marketing & Automation Desk 🍽️🤖

Welcome to **SmartBite AI**, a modern, high-end, and responsive **WhatsApp Automation & Customer Support Console** built specifically for restaurants and bistros. 

This console features a stunning dark slate cyber-lounge layout with glowing neon emerald badges, rich glassmorphic container cards, real-time message character limits, dynamic auto-responses, and a realistic **interactive WhatsApp smartphone simulator** with organic typing animations and delays.

---

## ⚡ Instant Online Testing (Demo Mode)

Anyone can immediately test and play with the entire interface without any local installations or configurations!

1. Visit the live hosted dashboard: **[SmartBite AI Console](https://venkattejaa.github.io/whatsapp-chatbot/)**
2. When the backend connection overlay modal pops up, click the cyan button: **`⚡ Try Online Demo Mode`**
3. The dashboard will instantly load into a sandboxed sandbox mode.
4. You can:
   - Customize **General Settings** (Business name, active timings, owner notification alert lines).
   - Edit **Core Auto-Replies** (Menu, combos, location maps, opening timings) and see the character limits update in real-time.
   - Create or delete **Custom Keywords** (try adding `wifi` or `offer`!).
   - Send simulated customer messages inside the **WhatsApp smartphone simulator** on the right side and see how the bot instantly matches your keywords and replies!
   - Type **`human`** or click **`5`** to trigger a **Human Escalation Alert**, open the **Handoff Inbox** tab to check the logged alert, and click **`Mark Resolved`** when complete!

---

## 🛠️ Step-by-Step Developer Setup Guide

If you wish to host your own active FastAPI python backend and route real WhatsApp messages through Twilio, follow the setup instructions below.

### 1. Local Installation
Make sure you have Python 3.8+ installed, then navigate into the directory and install dependencies:
```bash
# Navigate to the repository
cd whatsapp-chatbot

# Install required backend libraries
pip install fastapi uvicorn pydantic python-multipart
```

### 2. Start the Local Server
Launch the FastAPI server using Uvicorn:
```bash
python main.py
```
The console will verify connection and spin up at:
- **FastAPI backend REST endpoints**: `http://localhost:8000`
- **Local Dashboard Interface**: `http://localhost:8000/`

---

## 🌐 Deploying & Exposing the Webhook

To connect your local running server to the live web (so Twilio can dispatch webhooks to it):

### Option A: Tunneling via ngrok (Easiest for Local Testing)
1. Run ngrok on port 8000:
   ```bash
   ngrok http 8000
   ```
2. Copy the secure forwarding URL provided by ngrok (e.g., `https://xxxx-xx-xx.ngrok-free.app`).

### Option B: Deploying to Cloud Host (Production ready)
Simply deploy this repository to **Railway**, **Render**, or **Vercel** with `python main.py` as the start command. It will automatically build and serve.

---

## 📲 Hooking Up to Twilio Sandbox

To send real WhatsApp messages to the bot:

1. Go to your **Twilio Console** and configure a **WhatsApp Sandbox** sender.
2. In the Sandbox settings under **"A Message Comes In"**, paste your live webhook URL:
   ```text
   https://<your-ngrok-or-railway-url>/webhook
   ```
3. Save the configurations.
4. Text the sandbox join code from your phone's WhatsApp.
5. Send any message (e.g., `menu`, `timings`, or `human`) and see the bot instantly reply with your custom configurations directly inside WhatsApp!

---

## 🔗 Connecting Your Deployed Frontend Console
If you are accessing the console online at `https://venkattejaa.github.io/whatsapp-chatbot/` and want to bind it to your active server:
1. Click the **`🔗 API:`** status button in the top header.
2. Paste in your active backend URL (e.g., `https://xxxx.up.railway.app`).
3. Click **`Save & Synchronize`**.
4. The dashboard will connect, load all your live server settings, and let you test your real server configuration right in the visual simulator!
