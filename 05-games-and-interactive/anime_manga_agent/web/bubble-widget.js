/**
 * Anime/Manga Agent - Embeddable Bubble Widget
 * 
 * This module creates a floating bubble agent that displays SMS-like
 * notifications based on user activity on the website.
 * 
 * Usage:
 *   <script src="bubble-widget.js"></script>
 *   <script>
 *     const agent = new OtakuSenseiWidget({
 *       apiEndpoint: 'http://localhost:5000/api',
 *       userId: 'user123',
 *       token: 'jwt-token'
 *     });
 *     agent.init();
 *   </script>
 */

(function(global) {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const DEFAULT_CONFIG = {
        apiEndpoint: '/api',
        userId: null,
        token: null,
        position: 'bottom-right',
        bubbleSize: 70,
        phoneWidth: 380,
        phoneHeight: 600,
        maxNotifications: 5,
        notificationDuration: 8000,
        idleTimeout: 120000,
        enableIdleMessages: true,
        enableActivityTracking: true,
        theme: {
            primary: '#e94560',
            secondary: '#ff6b6b',
            background: '#0d1b2a',
            surface: '#1b2838',
            text: '#ffffff',
            accent: '#ffd700'
        }
    };

    // ============================================
    // STYLES
    // ============================================
    
    function injectStyles(config) {
        const theme = config.theme;
        const css = `
            /* Otaku Sensei Widget Styles */
            .otaku-widget-container * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            /* Floating Bubble */
            .otaku-bubble {
                position: fixed;
                ${config.position.includes('bottom') ? 'bottom: 30px;' : 'top: 30px;'}
                ${config.position.includes('right') ? 'right: 30px;' : 'left: 30px;'}
                width: ${config.bubbleSize}px;
                height: ${config.bubbleSize}px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                box-shadow: 0 8px 25px rgba(233, 69, 96, 0.4);
                transition: all 0.3s ease;
                z-index: 999999;
                animation: otaku-bubble-pulse 2s infinite;
            }
            
            .otaku-bubble:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(233, 69, 96, 0.6);
            }
            
            .otaku-bubble.active {
                animation: none;
                display: none;
            }
            
            @keyframes otaku-bubble-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            /* Notification Badge */
            .otaku-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 24px;
                height: 24px;
                background: ${theme.accent};
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: ${theme.background};
                animation: otaku-badge-bounce 0.5s ease;
            }
            
            .otaku-badge.visible {
                display: flex;
            }
            
            @keyframes otaku-badge-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            /* SMS Container */
            .otaku-sms-container {
                position: fixed;
                ${config.position.includes('bottom') ? 'bottom: 120px;' : 'top: 120px;'}
                ${config.position.includes('right') ? 'right: 30px;' : 'left: 30px;'}
                width: 320px;
                max-height: 400px;
                display: flex;
                flex-direction: column-reverse;
                gap: 10px;
                z-index: 999998;
                pointer-events: none;
            }
            
            /* SMS Bubble */
            .otaku-sms {
                background: linear-gradient(135deg, ${theme.surface}, #2a3f5f);
                border-radius: 20px 20px 5px 20px;
                padding: 12px 16px;
                color: ${theme.text};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                animation: otaku-sms-in 0.4s ease;
                pointer-events: auto;
                position: relative;
                max-width: 280px;
                margin-left: auto;
            }
            
            .otaku-sms::before {
                content: '🎌';
                position: absolute;
                left: -35px;
                bottom: 0;
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            .otaku-sms.important {
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            }
            
            .otaku-sms.celebration {
                background: linear-gradient(135deg, ${theme.accent}, #ff8c00);
                color: ${theme.background};
            }
            
            .otaku-sms .timestamp {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 5px;
                text-align: right;
            }
            
            @keyframes otaku-sms-in {
                from {
                    opacity: 0;
                    transform: translateX(50px) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }
            
            .otaku-sms.fade-out {
                animation: otaku-sms-out 0.3s ease forwards;
            }
            
            @keyframes otaku-sms-out {
                to {
                    opacity: 0;
                    transform: translateX(50px) scale(0.8);
                }
            }
            
            /* Phone Container */
            .otaku-phone {
                position: fixed;
                ${config.position.includes('bottom') ? 'bottom: 30px;' : 'top: 30px;'}
                ${config.position.includes('right') ? 'right: 30px;' : 'left: 30px;'}
                width: ${config.phoneWidth}px;
                height: ${config.phoneHeight}px;
                background: ${theme.background};
                border-radius: 40px;
                overflow: hidden;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                display: none;
                flex-direction: column;
                z-index: 1000000;
                border: 3px solid #2a3f5f;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .otaku-phone.active {
                display: flex;
                animation: otaku-phone-in 0.4s ease;
            }
            
            @keyframes otaku-phone-in {
                from {
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            /* Phone Notch */
            .otaku-phone-notch {
                width: 150px;
                height: 30px;
                background: ${theme.background};
                border-radius: 0 0 20px 20px;
                margin: 0 auto;
                position: relative;
            }
            
            .otaku-phone-notch::before {
                content: '';
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 5px;
                background: #2a3f5f;
                border-radius: 3px;
            }
            
            /* Phone Header */
            .otaku-phone-header {
                background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .otaku-phone-avatar {
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, ${theme.accent}, #ff8c00);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            }
            
            .otaku-phone-info h3 {
                color: ${theme.text};
                font-size: 16px;
                margin-bottom: 2px;
            }
            
            .otaku-phone-info p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 11px;
            }
            
            .otaku-phone-close {
                margin-left: auto;
                width: 35px;
                height: 35px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 50%;
                color: ${theme.text};
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            
            .otaku-phone-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* Phone Chat */
            .otaku-phone-chat {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .otaku-phone-chat::-webkit-scrollbar {
                width: 4px;
            }
            
            .otaku-phone-chat::-webkit-scrollbar-thumb {
                background: ${theme.primary};
                border-radius: 2px;
            }
            
            .otaku-chat-msg {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                animation: otaku-msg-in 0.3s ease;
            }
            
            @keyframes otaku-msg-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .otaku-chat-msg.agent {
                background: linear-gradient(135deg, ${theme.surface}, #2a3f5f);
                color: ${theme.text};
                align-self: flex-start;
                border-bottom-left-radius: 5px;
            }
            
            .otaku-chat-msg.user {
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                color: ${theme.text};
                align-self: flex-end;
                border-bottom-right-radius: 5px;
            }
            
            .otaku-chat-msg .time {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 5px;
            }
            
            /* Quick Actions */
            .otaku-quick-actions {
                padding: 10px 20px;
                background: ${theme.surface};
                display: flex;
                gap: 8px;
                overflow-x: auto;
            }
            
            .otaku-quick-actions button {
                padding: 8px 14px;
                border: none;
                border-radius: 18px;
                background: linear-gradient(135deg, #2a3f5f, #3a5f8f);
                color: ${theme.text};
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }
            
            .otaku-quick-actions button:hover {
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            }
            
            /* Phone Input */
            .otaku-phone-input {
                padding: 15px 20px;
                background: ${theme.surface};
                border-top: 1px solid #2a3f5f;
            }
            
            .otaku-input-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
                background: ${theme.background};
                border-radius: 25px;
                padding: 5px 15px;
                border: 2px solid #2a3f5f;
            }
            
            .otaku-input-wrapper:focus-within {
                border-color: ${theme.primary};
            }
            
            .otaku-input-wrapper input {
                flex: 1;
                padding: 10px 0;
                border: none;
                background: transparent;
                color: ${theme.text};
                font-size: 14px;
                outline: none;
            }
            
            .otaku-input-wrapper input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .otaku-input-wrapper button {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                color: ${theme.text};
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            
            .otaku-input-wrapper button:hover {
                transform: scale(1.05);
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'otaku-widget-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ============================================
    // WIDGET CLASS
    // ============================================
    
    class OtakuSenseiWidget {
        constructor(options = {}) {
            this.config = { ...DEFAULT_CONFIG, ...options };
            this.isPhoneOpen = false;
            this.notificationCount = 0;
            this.lastActivity = Date.now();
            this.idleTimer = null;
            this.chatHistory = [];
            this.elements = {};
            
            // Bind methods
            this.togglePhone = this.togglePhone.bind(this);
            this.sendMessage = this.sendMessage.bind(this); // No need to bind async, but good practice
            this.trackActivity = this.trackActivity.bind(this);
        }
        
        init() {
            // Inject styles
            injectStyles(this.config);
            
            // Create DOM elements
            this.createElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start idle detection
            if (this.config.enableIdleMessages) {
                this.startIdleDetection();
            }
            
            // Welcome message
            setTimeout(() => {
                this.showSMS(
                    "👋 Hey there! I'm your anime guide! I'll keep you updated~",
                    'important'
                );
            }, 2000);
            
            console.log('🎌 Otaku Sensei Widget initialized!');
        }
        
        createElements() {
            // Container
            const container = document.createElement('div');
            container.className = 'otaku-widget-container';
            
            // SMS Container
            const smsContainer = document.createElement('div');
            smsContainer.className = 'otaku-sms-container';
            smsContainer.id = 'otaku-sms-container';
            container.appendChild(smsContainer);
            this.elements.smsContainer = smsContainer;
            
            // Bubble
            const bubble = document.createElement('div');
            bubble.className = 'otaku-bubble';
            bubble.id = 'otaku-bubble';
            bubble.innerHTML = '🎌<div class="otaku-badge" id="otaku-badge">0</div>';
            bubble.onclick = this.togglePhone;
            container.appendChild(bubble);
            this.elements.bubble = bubble;
            this.elements.badge = bubble.querySelector('.otaku-badge');
            
            // Phone
            const phone = this.createPhoneElement();
            container.appendChild(phone);
            this.elements.phone = phone;
            
            document.body.appendChild(container);
        }
        
        createPhoneElement() {
            const phone = document.createElement('div');
            phone.className = 'otaku-phone';
            phone.id = 'otaku-phone';
            
            phone.innerHTML = `
                <div class="otaku-phone-notch"></div>
                <div class="otaku-phone-header">
                    <div class="otaku-phone-avatar">🎌</div>
                    <div class="otaku-phone-info">
                        <h3>Otaku Sensei</h3>
                        <p>Your Anime & Manga Guide • Online</p>
                    </div>
                    <button class="otaku-phone-close" id="otaku-close">✕</button>
                </div>
                <div class="otaku-phone-chat" id="otaku-chat">
                    <div class="otaku-chat-msg agent">
                        Hey there! 👋 I'm your personal anime guide. I'll keep you updated on your activity and give you recommendations!
                        <div class="time">Just now</div>
                    </div>
                </div>
                <div class="otaku-quick-actions">
                    <button data-action="recommend">🎬 Recommend</button>
                    <button data-action="trending">🔥 Trending</button>
                    <button data-action="watchlist">📚 Watchlist</button>
                    <button data-action="hottake">🔥 Hot Take</button>
                </div>
                <div class="otaku-phone-input">
                    <div class="otaku-input-wrapper">
                        <input type="text" id="otaku-input" placeholder="Ask me anything...">
                        <button id="otaku-send">➤</button>
                    </div>
                </div>
            `;
            
            return phone;
        }
        
        setupEventListeners() {
            // Close button
            document.getElementById('otaku-close').onclick = this.togglePhone;
            
            // Send button
            document.getElementById('otaku-send').onclick = this.sendMessage;
            
            // Input enter key
            document.getElementById('otaku-input').onkeypress = (e) => {
                if (e.key === 'Enter') this.sendMessage();
            };
            
            // Quick actions
            document.querySelectorAll('.otaku-quick-actions button').forEach(btn => {
                btn.onclick = () => this.handleQuickAction(btn.dataset.action);
            });
            
            // Activity tracking
            if (this.config.enableActivityTracking) {
                document.addEventListener('mousemove', () => this.lastActivity = Date.now());
                document.addEventListener('keypress', () => this.lastActivity = Date.now());
                document.addEventListener('click', () => this.lastActivity = Date.now());
            }
        }
        
        togglePhone() {
            this.isPhoneOpen = !this.isPhoneOpen;
            
            if (this.isPhoneOpen) {
                this.elements.phone.classList.add('active');
                this.elements.bubble.classList.add('active');
                this.notificationCount = 0;
                this.updateBadge();
            } else {
                this.elements.phone.classList.remove('active');
                this.elements.bubble.classList.remove('active');
            }
        }
        
        showSMS(message, type = 'normal') {
            const container = this.elements.smsContainer;
            const sms = document.createElement('div');
            sms.className = `otaku-sms ${type}`;
            
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            sms.innerHTML = `
                ${message}
                <div class="timestamp">${time}</div>
            `;
            
            container.appendChild(sms);
            
            // Update badge if phone is closed
            if (!this.isPhoneOpen) {
                this.notificationCount++;
                this.updateBadge();
            }
            
            // Auto-remove
            setTimeout(() => {
                sms.classList.add('fade-out');
                setTimeout(() => sms.remove(), 300);
            }, this.config.notificationDuration);
            
            // Limit visible SMS
            const allSms = container.querySelectorAll('.otaku-sms:not(.fade-out)');
            if (allSms.length > this.config.maxNotifications) {
                allSms[0].classList.add('fade-out');
                setTimeout(() => allSms[0].remove(), 300);
            }
        }
        
        updateBadge() {
            const badge = this.elements.badge;
            if (this.notificationCount > 0) {
                badge.classList.add('visible');
                badge.textContent = this.notificationCount > 9 ? '9+' : this.notificationCount;
            } else {
                badge.classList.remove('visible');
            }
        }
        
        addChatMessage(message, isAgent = true) {
            const chat = document.getElementById('otaku-chat');
            const msgDiv = document.createElement('div');
            msgDiv.className = `otaku-chat-msg ${isAgent ? 'agent' : 'user'}`;
            
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            msgDiv.innerHTML = `
                ${message}
                <div class="time">${time}</div>
            `;
            
            chat.appendChild(msgDiv);
            chat.scrollTop = chat.scrollHeight;
            
            this.chatHistory.push({ message, isAgent, time: now, element: msgDiv });
            return msgDiv;
        }
        
        async sendMessage() {
            const input = document.getElementById('otaku-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            this.addChatMessage(message, false);
            input.value = '';
            
            await this._sendChatMessageAndGetResponse(message);
        }
        
        async _sendChatMessageAndGetResponse(message) {
            // Add a "typing..." indicator
            const typingIndicator = this.addChatMessage("...", true);

            try {
                const response = await fetch(`${this.config.apiEndpoint}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.token}`
                    },
                    body: JSON.stringify({ message })
                });

                typingIndicator.remove();

                if (response.ok) {
                    const result = await response.json();
                    const reply = result.success && result.data.message 
                        ? result.data.message 
                        : "Sorry, I had a problem thinking of a response.";
                    this.addChatMessage(reply, true);
                } else {
                    this.addChatMessage("Sorry, I couldn't connect to my brain right now.", true);
                }
            } catch (error) {
                if(typingIndicator) typingIndicator.remove();
                console.error('Failed to send chat message:', error);
                this.addChatMessage("Oops, connection error. Are you sure I'm plugged in?", true);
            }
        }
        
        async handleQuickAction(action) {
            const actions = {
                recommend: "Recommend something",
                trending: "What's trending",
                watchlist: "My watchlist",
                hottake: "Give me a hot take"
            };
            
            const message = actions[action] || action;
            await this._sendChatMessageAndGetResponse(message);
        }
        
        async trackActivity(activityType, data = {}) {
            this.lastActivity = Date.now();

            let smsType = 'normal';
            if (activityType === 'complete_anime' || activityType === 'complete_manga') {
                smsType = 'celebration';
            } else if (activityType === 'idle' || activityType === 'new_episode') {
                smsType = 'important';
            }
            
            let message = `Activity: ${activityType}`; // Fallback message

            // Send to API and get the authoritative response
            if (this.config.apiEndpoint && this.config.token) {
                try {
                    const response = await fetch(`${this.config.apiEndpoint}/activity`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.token}`
                        },
                        body: JSON.stringify({
                            type: activityType,
                            data: data,
                            timestamp: new Date().toISOString()
                        })
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.message) {
                            message = result.message; // Use backend message
                        }
                    }
                } catch (error) {
                    console.error('Failed to send activity:', error);
                    message = "Could not connect to agent...";
                }
            }

            if (!message) return;

            this.showSMS(message, smsType);
            
            // Also add to chat if phone is open
            if (this.isPhoneOpen) {
                this.addChatMessage(message, true);
            }
        }
        
        startIdleDetection() {
            setInterval(() => {
                const idleTime = Date.now() - this.lastActivity;
                
                if (idleTime > this.config.idleTimeout) {
                    this.trackActivity('idle');
                    this.lastActivity = Date.now(); // Reset to avoid spam
                }
            }, 30000);
        }
        
        // Public API methods
        notify(message, type = 'normal') {
            this.showSMS(message, type);
        }
        
        onAddToWatchlist(animeTitle) {
            this.trackActivity('add_watchlist', { title: animeTitle });
        }
        
        onRemoveFromWatchlist(animeTitle) {
            this.trackActivity('remove_watchlist', { title: animeTitle });
        }
        
        onCompleteAnime(animeTitle) {
            this.trackActivity('complete_anime', { title: animeTitle });
        }
        
        onCompleteManga(mangaTitle) {
            this.trackActivity('complete_manga', { title: mangaTitle });
        }
        
        onRateAnime(animeTitle, rating) {
            this.trackActivity('rate_anime', { title: animeTitle, rating: rating });
        }
        
        onBrowseSeasonal() {
            this.trackActivity('browse_seasonal');
        }
        
        onSearch(query) {
            this.trackActivity('search_anime', { query: query });
        }
        
        onViewDetails(title) {
            this.trackActivity('view_details', { title: title });
        }
        
        onSaveLink(title, url) {
            this.trackActivity('save_link', { title: title, url: url });
        }
        
        onNewEpisode(animeTitle) {
            this.trackActivity('new_episode', { title: animeTitle });
        }
        
        onLogin() {
            this.trackActivity('login');
        }
        
        onLogout() {
            this.trackActivity('logout');
        }
        
        destroy() {
            const container = document.querySelector('.otaku-widget-container');
            if (container) container.remove();
            
            const styles = document.getElementById('otaku-widget-styles');
            if (styles) styles.remove();
            
            if (this.idleTimer) clearInterval(this.idleTimer);
        }
    }

    // Export to global scope
    global.OtakuSenseiWidget = OtakuSenseiWidget;

})(typeof window !== 'undefined' ? window : this);
