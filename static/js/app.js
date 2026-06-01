document.addEventListener("DOMContentLoaded", () => {
    // Current state
    let configData = {};
    let handoffData = [];

    // DOM Elements - General & Status
    const botStatusToggle = document.getElementById("botStatusToggle");
    const botStatusText = document.getElementById("botStatusText");
    const businessNameInput = document.getElementById("businessNameInput");
    const workingHoursInput = document.getElementById("workingHoursInput");
    const offHoursMsgInput = document.getElementById("offHoursMsgInput");
    const ownerPhoneInput = document.getElementById("ownerPhoneInput");
    const webhookUrlCode = document.getElementById("webhookUrlCode");
    const copyWebhookBtn = document.getElementById("copyWebhookBtn");
    
    // Save buttons
    const saveGeneralBtn = document.getElementById("saveGeneralBtn");
    const saveResponsesBtn = document.getElementById("saveResponsesBtn");

    // DOM Elements - Core Auto Replies
    const greetingMsgInput = document.getElementById("greetingMsgInput");
    const menuContentInput = document.getElementById("menuContentInput");
    const priceContentInput = document.getElementById("priceContentInput");
    const locationContentInput = document.getElementById("locationContentInput");
    const timingsContentInput = document.getElementById("timingsContentInput");

    // Character Counts
    const menuCount = document.getElementById("menuCount");
    const priceCount = document.getElementById("priceCount");
    const locCount = document.getElementById("locCount");
    const timeCount = document.getElementById("timeCount");

    // DOM Elements - Custom Keywords
    const newKwInput = document.getElementById("newKwInput");
    const newKwResponse = document.getElementById("newKwResponse");
    const addKwBtn = document.getElementById("addKwBtn");
    const keywordsList = document.getElementById("keywordsList");
    const kwCountText = document.getElementById("kwCountText");

    // DOM Elements - Handoffs
    const handoffsList = document.getElementById("handoffsList");
    const handoffBadge = document.getElementById("handoffBadge");
    const refreshHandoffsBtn = document.getElementById("refreshHandoffsBtn");

    // DOM Elements - Simulator
    const phoneTime = document.getElementById("phoneTime");
    const greetingTime = document.getElementById("greetingTime");
    const chatArea = document.getElementById("chatArea");
    const chatMsgInput = document.getElementById("chatMsgInput");
    const chatSendForm = document.getElementById("chatSendForm");
    const typingIndicator = document.getElementById("typingIndicator");
    const waBizName = document.getElementById("waBizName");
    const avatarLetter = document.getElementById("avatarLetter");
    const simInitialGreeting = document.getElementById("simInitialGreeting");

    // Toast & Navigation
    const toast = document.getElementById("toast");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Connection Modal Elements
    const connectionModal = document.getElementById("connectionModal");
    const backendUrlInput = document.getElementById("backendUrlInput");
    const connectBackendBtn = document.getElementById("connectBackendBtn");
    const launchDemoBtn = document.getElementById("launchDemoBtn");
    const changeApiUrlBtn = document.getElementById("changeApiUrlBtn");
    const apiStatusText = document.getElementById("apiStatusText");

    // Dynamic API routing & Demo state
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    let API_BASE_URL = isLocalhost ? "" : (localStorage.getItem("chatbot_api_url") || "");
    let isDemoMode = API_BASE_URL === "demo";

    // Standard mockup fallback configuration for Demo Mode
    const defaultDemoConfig = {
        status: true,
        business_name: "SmartBite Bistro",
        working_hours: "11:00-23:00",
        off_hours_message: "We are currently closed, but we have received your message and will reply first thing tomorrow!",
        owner_phone: "+919876543210",
        greeting_message: "Welcome to *SmartBite Bistro*! 🍽️ How can we help you today? Reply with:\n\n1️⃣ *Menu* - View our daily specials & food menu\n2️⃣ *Price* - See pricing & combo details\n3️⃣ *Location* - Get Google Maps address\n4️⃣ *Timings* - View opening & closing hours\n5️⃣ *Human* - Connect to a live agent",
        menu_content: "🍔 *SMARTBITE SPECIALS* 🍔\n\n1. Double Cheese Volcano Burger - *₹189*\n2. Peri-Peri Crispy Chicken Wrap - *₹149*\n3. Sizzling Brownie with Ice Cream - *₹129*\n\nReply with *2* to see our combo deals!",
        price_content: "💰 *BISTRONOMY COMBOS* 💰\n\n• *Solo Feast:* 1 Burger + 1 Fries + 1 Coke - *₹249*\n• *Buddy Pack:* 2 Wraps + 1 Loaded Fries + 2 Cokes - *₹399*\n• *Family Treat:* 2 Burgers + 2 Wraps + 1 Brownie - *₹599*",
        location_content: "📍 *OUR BISTRO ADDRESS* 📍\n\nSmartBite Bistro, Ground Floor, Elite Plaza, Main Road, Guntakal.\n\nGoogle Maps Link: _https://maps.google.com/?q=SmartBite+Bistro_",
        timings_content: "⏰ *OPERATING HOURS* ⏰\n\nWe serve fresh happiness everyday:\n• *Monday - Sunday:* 11:00 AM - 11:00 PM\n\nNote: Last kitchen order closes at 10:45 PM.",
        custom_keywords: [
            { keyword: "wifi", response: "📶 Guest Wi-Fi password is *smartbiteguest2026*" },
            { keyword: "offer", response: "🎉 Use code *BITE10* to get 10% off on orders above ₹499!" }
        ]
    };

    // Update connection status visual tags
    function updateConnectionStateUI() {
        if (isDemoMode) {
            if (apiStatusText) apiStatusText.textContent = "Demo (Sandbox)";
            if (webhookUrlCode) webhookUrlCode.textContent = "https://demo-mode.api/webhook";
        } else if (isLocalhost && !localStorage.getItem("chatbot_api_url")) {
            if (apiStatusText) apiStatusText.textContent = "Local";
            if (webhookUrlCode) webhookUrlCode.textContent = `${window.location.origin}/webhook`;
        } else {
            const displayUrl = API_BASE_URL || "Not Connected";
            if (apiStatusText) {
                const clean = displayUrl.replace(/^https?:\/\//i, '');
                apiStatusText.textContent = clean.length > 15 ? clean.substring(0, 13) + '...' : clean;
            }
            if (webhookUrlCode) {
                webhookUrlCode.textContent = `${API_BASE_URL}/webhook`;
            }
        }
    }

    // Set simulated phone clock time
    function updatePhoneClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = `${hours}:${minutes} ${ampm}`;
        
        if (phoneTime) phoneTime.textContent = timeStr;
        if (greetingTime) greetingTime.textContent = timeStr;
    }
    updatePhoneClock();
    setInterval(updatePhoneClock, 30000);

    // Copy to clipboard helper
    if (copyWebhookBtn && webhookUrlCode) {
        copyWebhookBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(webhookUrlCode.textContent).then(() => {
                showToast("Webhook URL copied to clipboard!");
            });
        });
    }

    // Tab Navigation Logic
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(`tab-${targetTab}`).classList.add("active");
        });
    });

    // Character Counter triggers
    function setupCharCounters() {
        const counters = [
            { el: menuContentInput, label: menuCount },
            { el: priceContentInput, label: priceCount },
            { el: locationContentInput, label: locCount },
            { el: timingsContentInput, label: timeCount }
        ];

        counters.forEach(c => {
            if (c.el && c.label) {
                c.el.addEventListener("input", () => {
                    c.label.textContent = `${c.el.value.length} characters`;
                });
            }
        });
    }
    setupCharCounters();

    // Show custom toast alert
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove("hidden");
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    // Format WhatsApp message formatting tags (asterisk -> bold, underscore -> italic, newline -> br)
    function formatWhatsAppMessage(text) {
        if (!text) return "";
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Bold: *text* -> <b>text</b>
        html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
        
        // Italic: _text_ -> <em>text</em>
        html = html.replace(/_(.*?)_/g, "<em>$1</em>");

        // Strikeout: ~text~ -> <del>text</del>
        html = html.replace(/~(.*?)~/g, "<del>$1</del>");
        
        // Newlines to break-lines
        html = html.replace(/\n/g, "<br>");
        
        return html;
    }

    // Load configurations from backend or localStorage in Demo Mode
    async function loadConfig() {
        try {
            if (isDemoMode) {
                const stored = localStorage.getItem("demo_chatbot_config");
                if (stored) {
                    configData = JSON.parse(stored);
                } else {
                    configData = defaultDemoConfig;
                    localStorage.setItem("demo_chatbot_config", JSON.stringify(defaultDemoConfig));
                }
            } else {
                const response = await fetch(API_BASE_URL + "/api/config");
                if (!response.ok) throw new Error("Network issues loading config.");
                configData = await response.json();
            }
            
            // Populate inputs
            if (botStatusToggle) {
                botStatusToggle.checked = configData.status;
                updateStatusText(configData.status);
            }
            if (businessNameInput) businessNameInput.value = configData.business_name || "";
            if (workingHoursInput) workingHoursInput.value = configData.working_hours || "";
            if (offHoursMsgInput) offHoursMsgInput.value = configData.off_hours_message || "";
            if (ownerPhoneInput) ownerPhoneInput.value = configData.owner_phone || "";
            
            if (greetingMsgInput) greetingMsgInput.value = configData.greeting_message || "";
            if (menuContentInput) {
                menuContentInput.value = configData.menu_content || "";
                menuCount.textContent = `${menuContentInput.value.length} characters`;
            }
            if (priceContentInput) {
                priceContentInput.value = configData.price_content || "";
                priceCount.textContent = `${priceContentInput.value.length} characters`;
            }
            if (locationContentInput) {
                locationContentInput.value = configData.location_content || "";
                locCount.textContent = `${locationContentInput.value.length} characters`;
            }
            if (timingsContentInput) {
                timingsContentInput.value = configData.timings_content || "";
                timeCount.textContent = `${timingsContentInput.value.length} characters`;
            }

            // Sync Simulator Header
            if (waBizName) waBizName.textContent = configData.business_name || "SmartBite Bistro";
            if (avatarLetter && configData.business_name) {
                avatarLetter.textContent = configData.business_name.charAt(0).toUpperCase();
            }
            if (simInitialGreeting) {
                simInitialGreeting.innerHTML = formatWhatsAppMessage(configData.greeting_message);
            }

            // Populate Custom Keywords
            renderKeywords(configData.custom_keywords || []);

        } catch (error) {
            console.error("Error fetching config:", error);
            showToast("⚠️ Failed to load settings. Server is offline.");
        }
    }

    // Update Bot Status Active text
    function updateStatusText(isActive) {
        if (!botStatusText) return;
        if (isActive) {
            botStatusText.textContent = "Active";
            botStatusText.className = "status-text active";
        } else {
            botStatusText.textContent = "Inactive";
            botStatusText.className = "status-text inactive";
        }
    }

    // Toggle bot status globally from status header switch
    if (botStatusToggle) {
        botStatusToggle.addEventListener("change", async () => {
            const isActive = botStatusToggle.checked;
            updateStatusText(isActive);
            configData.status = isActive;
            
            if (isDemoMode) {
                localStorage.setItem("demo_chatbot_config", JSON.stringify(configData));
                showToast(isActive ? "Demo Bot activated! 🟢" : "Demo Bot paused. 🔴");
            } else {
                try {
                    const response = await fetch(API_BASE_URL + "/api/config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(configData)
                    });
                    if (response.ok) {
                        showToast(isActive ? "Bot activated successfully! 🟢" : "Bot paused successfully. 🔴");
                    }
                } catch (error) {
                    console.error("Error saving status toggle:", error);
                }
            }
        });
    }

    // Save General Settings
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener("click", async () => {
            configData.business_name = businessNameInput.value;
            configData.working_hours = workingHoursInput.value;
            configData.off_hours_message = offHoursMsgInput.value;
            configData.owner_phone = ownerPhoneInput.value;

            // Sync with simulator
            if (waBizName) waBizName.textContent = configData.business_name;
            if (avatarLetter && configData.business_name) {
                avatarLetter.textContent = configData.business_name.charAt(0).toUpperCase();
            }

            await saveAllConfig("General configurations saved!");
        });
    }

    // Save Core Auto Replies
    if (saveResponsesBtn) {
        saveResponsesBtn.addEventListener("click", async () => {
            configData.greeting_message = greetingMsgInput.value;
            configData.menu_content = menuContentInput.value;
            configData.price_content = priceContentInput.value;
            configData.location_content = locationContentInput.value;
            configData.timings_content = timingsContentInput.value;

            // Sync greeting message in simulator
            if (simInitialGreeting) {
                simInitialGreeting.innerHTML = formatWhatsAppMessage(configData.greeting_message);
            }

            await saveAllConfig("Core responses saved!");
        });
    }

    // Core helper to POST configuration
    async function saveAllConfig(successMessage) {
        if (isDemoMode) {
            localStorage.setItem("demo_chatbot_config", JSON.stringify(configData));
            showToast(successMessage + " (Saved to Demo State)");
            return;
        }
        try {
            const response = await fetch(API_BASE_URL + "/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(configData)
            });
            if (response.ok) {
                const updated = await response.json();
                configData = updated; // Sync local state
                showToast(successMessage);
            } else {
                throw new Error("HTTP error saving config.");
            }
        } catch (error) {
            console.error("Error saving config:", error);
            showToast("⚠️ Save failed. Check server status.");
        }
    }

    // Render Custom Keywords list UI
    function renderKeywords(keywords) {
        if (!keywordsList) return;
        keywordsList.innerHTML = "";
        
        if (kwCountText) {
            kwCountText.textContent = keywords.length;
        }

        if (keywords.length === 0) {
            keywordsList.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">
                    No custom keywords created. Add one above!
                </div>
            `;
            return;
        }

        keywords.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "keyword-item-card";
            
            card.innerHTML = `
                <div class="keyword-badge-container">
                    <span class="keyword-tag">${escapeHtml(item.keyword)}</span>
                    <span class="keyword-response-text">${formatWhatsAppMessage(item.response)}</span>
                </div>
                <button class="btn-delete-kw" data-index="${index}" title="Delete Rule">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" fill="currentColor"/>
                    </svg>
                </button>
            `;
            
            keywordsList.appendChild(card);
        });

        // Attach delete events
        document.querySelectorAll(".btn-delete-kw").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const index = parseInt(btn.getAttribute("data-index"));
                configData.custom_keywords.splice(index, 1);
                await saveAllConfig("Custom keyword deleted.");
                renderKeywords(configData.custom_keywords);
            });
        });
    }

    // Add new keyword action
    if (addKwBtn) {
        addKwBtn.addEventListener("click", async () => {
            const keyword = newKwInput.value.trim();
            const response = newKwResponse.value.trim();

            if (!keyword || !response) {
                showToast("⚠️ Enter both keyword and reply text.");
                return;
            }

            // Check if keyword already exists
            const exists = configData.custom_keywords.some(
                item => item.keyword.toLowerCase() === keyword.toLowerCase()
            );

            if (exists) {
                showToast("⚠️ This keyword rule already exists.");
                return;
            }

            configData.custom_keywords.push({ keyword, response });
            
            // Clear inputs
            newKwInput.value = "";
            newKwResponse.value = "";

            await saveAllConfig("New keyword added!");
            renderKeywords(configData.custom_keywords);
        });
    }

    // Escaping HTML characters
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Handoff Inbox Management
    async function fetchHandoffs() {
        if (!isDemoMode && !API_BASE_URL && !isLocalhost) return;
        try {
            if (isDemoMode) {
                const stored = localStorage.getItem("demo_handoffs");
                if (stored) {
                    handoffData = JSON.parse(stored);
                } else {
                    handoffData = [
                        { id: 1, phone: "+919876543210", timestamp: "Today at 12:05 PM", initial_message: "Need to speak with a human support agent", status: "Pending" }
                    ];
                    localStorage.setItem("demo_handoffs", JSON.stringify(handoffData));
                }
            } else {
                const response = await fetch(API_BASE_URL + "/api/handoffs");
                if (!response.ok) throw new Error("HTTP error fetching handoffs.");
                handoffData = await response.json();
            }
            
            renderHandoffs(handoffData);
        } catch (error) {
            console.error("Error fetching handoffs:", error);
        }
    }

    function renderHandoffs(handoffs) {
        if (!handoffsList) return;
        handoffsList.innerHTML = "";

        const pendingCount = handoffs.filter(h => h.status === "Pending").length;
        
        // Update dashboard badges
        if (handoffBadge) {
            if (pendingCount > 0) {
                handoffBadge.textContent = pendingCount;
                handoffBadge.classList.remove("hidden");
                document.getElementById("handoffTabBtn").classList.add("pulsing-tab");
            } else {
                handoffBadge.classList.add("hidden");
                document.getElementById("handoffTabBtn").classList.remove("pulsing-tab");
            }
        }

        if (handoffs.length === 0) {
            handoffsList.innerHTML = `
                <div class="no-handoffs">
                    <div class="check-icon">✓</div>
                    <h4>All Clear!</h4>
                    <p>No customers are waiting for a human agent right now.</p>
                </div>
            `;
            return;
        }

        handoffs.forEach(item => {
            const card = document.createElement("div");
            card.className = `handoff-card ${item.status === "Resolved" ? "resolved" : ""}`;
            
            const actionButton = item.status === "Pending" 
                ? `<button class="btn-resolve" data-id="${item.id}">Mark Resolved</button>`
                : `<span class="btn-resolved-state">Resolved</span>`;

            card.innerHTML = `
                <div class="handoff-details">
                    <div class="handoff-user-row">
                        <span class="handoff-phone">${escapeHtml(item.phone)}</span>
                        <span class="handoff-time">${escapeHtml(item.timestamp)}</span>
                    </div>
                    <div class="handoff-msg-quote">
                        "${escapeHtml(item.initial_message)}"
                    </div>
                </div>
                <div class="handoff-action-area">
                    ${actionButton}
                </div>
            `;

            handoffsList.appendChild(card);
        });

        // Attach resolve click handlers
        document.querySelectorAll(".btn-resolve").forEach(btn => {
            btn.addEventListener("click", async () => {
                const handoffId = parseInt(btn.getAttribute("data-id"));
                if (isDemoMode) {
                    handoffData = handoffData.map(h => h.id === handoffId ? { ...h, status: "Resolved" } : h);
                    localStorage.setItem("demo_handoffs", JSON.stringify(handoffData));
                    showToast("Demo handoff resolved!");
                    renderHandoffs(handoffData);
                } else {
                    try {
                        const response = await fetch(API_BASE_URL + "/api/handoffs/resolve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: handoffId })
                        });
                        if (response.ok) {
                            showToast("Handoff request resolved.");
                            fetchHandoffs();
                        }
                    } catch (error) {
                        console.error("Error resolving handoff:", error);
                    }
                }
            });
        });
    }

    if (refreshHandoffsBtn) {
        refreshHandoffsBtn.addEventListener("click", fetchHandoffs);
    }

    // Connect remote backend modal button click handler
    if (connectBackendBtn && backendUrlInput) {
        connectBackendBtn.addEventListener("click", async () => {
            let url = backendUrlInput.value.trim();
            if (!url) {
                showToast("⚠️ Please enter a valid URL.");
                return;
            }
            if (url.endsWith("/")) {
                url = url.slice(0, -1);
            }
            if (!/^https?:\/\//i.test(url)) {
                url = "http://" + url;
            }
            
            isDemoMode = false;
            API_BASE_URL = url;
            localStorage.setItem("chatbot_api_url", url);
            if (connectionModal) connectionModal.classList.add("hidden");
            showToast("🔗 Connecting to remote backend...");
            
            updateConnectionStateUI();
            await loadConfig();
            await fetchHandoffs();
        });
    }

    // Launch Demo Mode trigger click handler
    if (launchDemoBtn) {
        launchDemoBtn.addEventListener("click", async () => {
            isDemoMode = true;
            API_BASE_URL = "demo";
            localStorage.setItem("chatbot_api_url", "demo");
            if (connectionModal) connectionModal.classList.add("hidden");
            showToast("⚡ Launched Sandbox Demo Mode!");
            
            updateConnectionStateUI();
            await loadConfig();
            await fetchHandoffs();
        });
    }

    // Change API URL button click
    if (changeApiUrlBtn) {
        changeApiUrlBtn.addEventListener("click", () => {
            if (backendUrlInput) {
                backendUrlInput.value = isDemoMode ? "" : (API_BASE_URL || "");
            }
            if (connectionModal) connectionModal.classList.remove("hidden");
        });
    }

    // Client-side simulator processing for sandbox Demo Mode
    function processDemoSimulatorReply(text) {
        const clean = text.toLowerCase().trim();
        let reply = "";
        let handoff = false;

        // Check if bot disabled globally in configuration
        if (!configData.status) {
            return {
                response: "⚠️ *Auto-Reply Bot is Offline.*\n\nThe business owner has temporarily disabled automatic replies.",
                handoff_triggered: false
            };
        }

        if (clean === "menu" || clean === "1" || clean === "1️⃣") {
            reply = configData.menu_content;
        } else if (clean === "price" || clean === "pricing" || clean === "2" || clean === "2️⃣") {
            reply = configData.price_content;
        } else if (clean === "location" || clean === "address" || clean === "3" || clean === "3️⃣") {
            reply = configData.location_content;
        } else if (clean === "timings" || clean === "timing" || clean === "hours" || clean === "4" || clean === "4️⃣") {
            reply = configData.timings_content;
        } else if (clean === "human" || clean === "support" || clean === "agent" || clean === "5" || clean === "5️⃣") {
            reply = "🚨 *Talk to Human Request Received!*\n\nI have logged your request and notified the owner. A human agent will connect with you shortly. 🙏";
            handoff = true;
            
            // Add a new pending handoff in demo state
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newHandoff = {
                id: Date.now(),
                phone: "+15550199",
                timestamp: `Today at ${timeStr}`,
                initial_message: text,
                status: "Pending"
            };
            handoffData.unshift(newHandoff);
            localStorage.setItem("demo_handoffs", JSON.stringify(handoffData));
        } else {
            // Check custom keywords
            let matched = false;
            for (let item of (configData.custom_keywords || [])) {
                const kw = item.keyword.toLowerCase().trim();
                if (kw && (clean === kw || clean.includes(` ${kw} `) || clean.startsWith(`${kw} `) || clean.endsWith(` ${kw}`))) {
                    reply = item.response;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                reply = configData.greeting_message;
            }
        }

        // Simulating off-hours notice appending
        const mockNow = new Date();
        const mockHour = mockNow.getHours();
        // Assume operating hours 11:00-23:00 (11 AM to 11 PM) for demo
        if (mockHour < 11 || mockHour >= 23) {
            reply = `${reply}\n\n⚠️ *[OFF-HOURS NOTICE]*\n${configData.off_hours_message}`;
        }

        return { response: reply, handoff_triggered: handoff };
    }

    // Live Chat Simulator logic
    if (chatSendForm) {
        chatSendForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = chatMsgInput.value.trim();
            if (!text) return;

            // Clear input
            chatMsgInput.value = "";

            // Append Outgoing Customer Message
            appendSimulatorBubble(text, "outgoing");
            scrollToBottom();

            // Emulate "Typing..." state
            showSimulatorTyping(true);

            if (isDemoMode) {
                setTimeout(() => {
                    showSimulatorTyping(false);
                    const result = processDemoSimulatorReply(text);
                    appendSimulatorBubble(result.response, "incoming");
                    scrollToBottom();

                    if (result.handoff_triggered) {
                        renderHandoffs(handoffData);
                        showToast("🚨 Alert: Customer requested human assistance!");
                    }
                }, 750);
            } else {
                try {
                    const response = await fetch(API_BASE_URL + "/api/simulator", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            message: text,
                            phone: "+15550199" // Mock tester phone
                        })
                    });

                    if (!response.ok) throw new Error("HTTP error simulating response.");
                    const data = await response.json();

                    setTimeout(() => {
                        showSimulatorTyping(false);
                        appendSimulatorBubble(data.response, "incoming");
                        scrollToBottom();

                        if (data.handoff_triggered) {
                            fetchHandoffs();
                            showToast("🚨 Alert: Customer requested human assistance!");
                        }
                    }, 750);

                } catch (error) {
                    console.error("Error running simulation:", error);
                    setTimeout(() => {
                        showSimulatorTyping(false);
                        appendSimulatorBubble("⚠️ *Error:* Failed to receive response from server. Make sure FastAPI server is running.", "incoming");
                        scrollToBottom();
                    }, 500);
                }
            }
        });
    }

    function appendSimulatorBubble(text, type) {
        if (!chatArea) return;
        
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = `${hours}:${minutes} ${ampm}`;

        const bubble = document.createElement("div");
        bubble.className = `msg-bubble ${type} animate-pop`;

        const textDiv = document.createElement("div");
        textDiv.className = "msg-text";
        textDiv.innerHTML = formatWhatsAppMessage(text);

        const timeDiv = document.createElement("div");
        timeDiv.className = "msg-time";
        timeDiv.textContent = timeStr;

        bubble.appendChild(textDiv);
        bubble.appendChild(timeDiv);
        chatArea.appendChild(bubble);
    }

    function showSimulatorTyping(show) {
        if (!typingIndicator) return;
        if (show) {
            if (configData.business_name) {
                document.getElementById("typingName").textContent = configData.business_name;
            }
            typingIndicator.classList.remove("hidden");
        } else {
            typingIndicator.classList.add("hidden");
        }
    }

    function scrollToBottom() {
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    }

    // INITIAL LOADING RUNS
    async function init() {
        updateConnectionStateUI();
        if (!isDemoMode && !isLocalhost && !API_BASE_URL) {
            if (connectionModal) connectionModal.classList.remove("hidden");
            return;
        }
        await loadConfig();
        await fetchHandoffs();
        
        // Auto refresh handoff inbox every 8 seconds in background (disabled in demo to prevent console spam)
        if (!isDemoMode) {
            setInterval(fetchHandoffs, 8000);
        }
    }

    init();
});
