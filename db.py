import json
import os
from threading import Lock

DATA_FILE = "data.json"
db_lock = Lock()

DEFAULT_CONFIG = {
    "business_name": "SmartBite Bistro",
    "status": True,
    "greeting_message": "Welcome to *SmartBite Bistro*! 🍽️ How can we help you today? Reply with:\n\n1️⃣ *Menu* - View our daily specials & food menu\n2️⃣ *Price* - See pricing & combo details\n3️⃣ *Location* - Get Google Maps address\n4️⃣ *Timings* - View opening & closing hours\n5️⃣ *Human* - Connect to a live agent",
    "menu_content": "🍔 *SmartBite Bistro Menu* 🍔\n\n🔹 *Starters*:\n- Garlic Bread: ₹149\n- Crispy Veg Fries: ₹199\n- Chicken Wings: ₹299\n\n🔹 *Mains*:\n- Gourmet Cheese Burger: ₹249\n- Exotic Veg Pizza (10\"): ₹399\n- Classic Margherita: ₹299\n- Grilled Chicken Steak: ₹449\n\n🔹 *Desserts & Drinks*:\n- Chocolate Sizzler: ₹189\n- Fresh Mint Mojito: ₹129",
    "price_content": "💰 *Special Combos & Price List* 💰\n\n🌟 *Solo Feast* - ₹349\n(Veg/Chicken Burger + Fries + Drink)\n\n🌟 *Double Treat* - ₹699\n(Margherita Pizza + Cheese Burger + 2 Drinks)\n\n🌟 *Family Platter* - ₹1,299\n(Veg Pizza + 2 Burgers + Fries + Chocolate Sizzler + 4 Drinks)\n\n*All prices are inclusive of GST. Deliveries have flat ₹30 charge.*",
    "location_content": "📍 *Our Location* 📍\n\nWe are located at:\n*123 Food Street, Cyber City, Bangalore - 560001*\n\n🗺️ *Google Maps Link*:\nhttps://maps.app.goo.gl/ab123xyz\n\n🚗 Come visit us today! Valet parking is available.",
    "timings_content": "⏰ *Operating Hours* ⏰\n\n📅 We are open all days!\n\n- *Monday to Friday*: 11:00 AM - 11:00 PM\n- *Saturday & Sunday*: 11:00 AM - 12:00 Midnight\n\n🌙 *Late Night Delivery* is active until 2:00 AM on weekends!",
    "off_hours_message": "🌙 Note: We are currently closed. Our chatbot is answering, but any orders or direct human responses will be processed when we open at 11:00 AM! Thank you for understanding.",
    "owner_phone": "+919876543210",
    "custom_keywords": [
        {"keyword": "wifi", "response": "Password is 'bistroguest' 📶 Enjoy high-speed internet!"},
        {"keyword": "offer", "response": "🎉 TODAY'S DEAL: Get 15% OFF on all mains! Use code: SMARTBITE15 when ordering. Valid till midnight!"},
        {"keyword": "hello", "response": "Hey there! How can we help you today? Reply with:\n- *menu* for our menu\n- *price* for combo prices\n- *location* for our address\n- *human* to talk to us"},
        {"keyword": "hi", "response": "Hey there! How can we help you today? Reply with:\n- *menu* for our menu\n- *price* for combo prices\n- *location* for our address\n- *human* to talk to us"}
    ],
    "handoffs": []
}

def load_data():
    with db_lock:
        if not os.path.exists(DATA_FILE):
            save_data_unsafe(DEFAULT_CONFIG)
            return DEFAULT_CONFIG
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure all default config fields are present in existing file
                updated = False
                for key, val in DEFAULT_CONFIG.items():
                    if key not in data:
                        data[key] = val
                        updated = True
                if updated:
                    save_data_unsafe(data)
                return data
        except Exception as e:
            print(f"Error reading database: {e}. Resetting to defaults.")
            save_data_unsafe(DEFAULT_CONFIG)
            return DEFAULT_CONFIG

def save_data(data):
    with db_lock:
        save_data_unsafe(data)

def save_data_unsafe(data):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving database: {e}")

# Helper to fetch configuration
def get_config():
    data = load_data()
    return {k: v for k, v in data.items() if k != "handoffs"}

# Helper to update configuration
def update_config(new_config):
    data = load_data()
    for key, val in new_config.items():
        if key != "handoffs":
            data[key] = val
    save_data(data)
    return get_config()

# Helper to fetch all handoffs
def get_handoffs():
    data = load_data()
    return data.get("handoffs", [])

# Helper to log a handoff
def add_handoff(phone, initial_message, timestamp):
    data = load_data()
    handoffs = data.get("handoffs", [])
    
    # Check if there is already an active handoff for this number to avoid duplication
    existing = [h for h in handoffs if h["phone"] == phone and h["status"] == "Pending"]
    if not existing:
        new_item = {
            "id": len(handoffs) + 1,
            "phone": phone,
            "initial_message": initial_message,
            "timestamp": timestamp,
            "status": "Pending"
        }
        handoffs.insert(0, new_item)  # New handoffs first
        data["handoffs"] = handoffs
        save_data(data)
        return new_item
    return existing[0]

# Helper to resolve a handoff
def resolve_handoff(handoff_id):
    data = load_data()
    handoffs = data.get("handoffs", [])
    for h in handoffs:
        if h.get("id") == handoff_id:
            h["status"] = "Resolved"
            break
    data["handoffs"] = handoffs
    save_data(data)
    return handoffs
