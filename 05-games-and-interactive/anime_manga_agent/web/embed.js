/**
 * AnimeManga Agent — Embeddable Chat Widget
 * ==========================================
 * Drop this single <script> tag into any anime-tracking website to add the
 * AI chat assistant as a floating bubble widget.
 *
 * QUICK START
 * -----------
 * 1. Start the agent API server:
 *      python main.py
 *
 * 2. Add to your website's <body> (before </body>):
 *      <script
 *        src="http://YOUR_SERVER:5000/embed.js"
 *        data-api-url="http://YOUR_SERVER:5000"
 *        data-lang="en"
 *        data-theme="dark"
 *        data-position="bottom-right"
 *      ></script>
 *
 * CONFIGURATION ATTRIBUTES
 * ------------------------
 * data-api-url      Base URL of the AnimeManga Agent API  (default: http://localhost:5000)
 * data-lang         UI language: en | ja | ru | es | lt   (default: en)
 * data-theme        dark | light                           (default: dark)
 * data-position     bottom-right | bottom-left            (default: bottom-right)
 * data-token        JWT auth token if user is logged in   (optional)
 * data-site-name    Name of your website shown in header  (optional)
 *
 * JAVASCRIPT API (after load)
 * ---------------------------
 * window.AnimeMangaAgent.open()          — open the chat window
 * window.AnimeMangaAgent.close()         — close the chat window
 * window.AnimeMangaAgent.sendMessage(m)  — send a message programmatically
 * window.AnimeMangaAgent.setToken(t)     — update auth token (e.g. after login)
 * window.AnimeMangaAgent.setAnimeList(l) — push your site's anime list for context
 * window.AnimeMangaAgent.trackActivity(type, data) — notify agent of user actions
 *
 * WEBSITE INTEGRATION — ANIME LIST CONTEXT
 * -----------------------------------------
 * Pass your site's anime database so the agent can give personalised answers:
 *
 *   window.AnimeMangaAgent.setAnimeList([
 *     { mal_id: 52991, title: "Sousou no Frieren", status: "watching",
 *       score: 10, episodes_watched: 28 },
 *     { mal_id: 40748, title: "Jujutsu Kaisen", status: "completed", score: 9 }
 *   ]);
 *
 * ACTIVITY TRACKING
 * -----------------
 * Trigger agent reactions when users interact with your site:
 *
 *   window.AnimeMangaAgent.trackActivity('add_watchlist', { title: 'Frieren' });
 *   window.AnimeMangaAgent.trackActivity('complete_anime', { title: 'AoT' });
 *   window.AnimeMangaAgent.trackActivity('rate_anime', { title: 'AoT', rating: 10 });
 *   window.AnimeMangaAgent.trackActivity('browse_seasonal', {});
 *
 * AIRING NOW / SCHEDULE (direct API calls from your frontend)
 * -----------------------------------------------------------
 *   GET  /api/airing/now              — currently airing anime (Jikan)
 *   GET  /api/airing/schedule         — full weekly schedule (Jikan)
 *   GET  /api/airing/schedule?day=monday — single day schedule
 *   GET  /api/airing/anichart         — current season (AniList/AniChart)
 *   GET  /api/airing/anichart?season=spring&year=2025
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────

  const script = document.currentScript ||
    document.querySelector('script[data-api-url], script[src*="embed.js"]');

  const CONFIG = {
    apiUrl:    (script && script.getAttribute('data-api-url'))   || 'http://localhost:5000',
    lang:      (script && script.getAttribute('data-lang'))      || 'en',
    theme:     (script && script.getAttribute('data-theme'))     || 'dark',
    position:  (script && script.getAttribute('data-position'))  || 'bottom-right',
    token:     (script && script.getAttribute('data-token'))     || null,
    siteName:  (script && script.getAttribute('data-site-name')) || 'Anime Tracker',
  };

  // ── State ──────────────────────────────────────────────────────────────────

  let isOpen        = false;
  let animeList     = [];
  let notifCount    = 0;
  let typingTimer   = null;

  // ── Styles ─────────────────────────────────────────────────────────────────

  const DARK = {
    bg:          '#0d1b2a',
    surface:     '#1b2838',
    surface2:    '#2a3f5f',
    accent:      '#e94560',
    accentLight: '#ff6b6b',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.6)',
    border:      '#2a3f5f',
    userBubble:  'linear-gradient(135deg,#e94560,#ff6b6b)',
    agentBubble: 'linear-gradient(135deg,#1b2838,#2a3f5f)',
    inputBg:     '#0d1b2a',
  };

  const LIGHT = {
    bg:          '#f5f5f5',
    surface:     '#ffffff',
    surface2:    '#e8e8e8',
    accent:      '#e94560',
    accentLight: '#ff6b6b',
    text:        '#1a1a2e',
    textMuted:   'rgba(0,0,0,0.5)',
    border:      '#ddd',
    userBubble:  'linear-gradient(135deg,#e94560,#ff6b6b)',
    agentBubble: '#e8e8e8',
    inputBg:     '#f0f0f0',
  };

  const C = CONFIG.theme === 'light' ? LIGHT : DARK;
  const isRight = CONFIG.position !== 'bottom-left';

  // ── CSS injection ──────────────────────────────────────────────────────────

  const css = `
    #ama-bubble {
      position: fixed;
      ${isRight ? 'right: 24px' : 'left: 24px'};
      bottom: 24px;
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${C.accent}, ${C.accentLight});
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      box-shadow: 0 6px 20px rgba(233,69,96,0.45);
      z-index: 2147483646;
      transition: transform .25s, box-shadow .25s;
      animation: ama-pulse 2.5s infinite;
      user-select: none;
    }
    #ama-bubble:hover { transform: scale(1.1); box-shadow: 0 10px 30px rgba(233,69,96,0.6); }
    #ama-bubble.open  { animation: none; }
    @keyframes ama-pulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.06); }
    }
    #ama-badge {
      position: absolute; top: -4px; ${isRight ? 'right: -4px' : 'left: -4px'};
      width: 20px; height: 20px;
      background: #ffd700; border-radius: 50%;
      display: none; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #1a1a2e;
    }
    #ama-window {
      position: fixed;
      ${isRight ? 'right: 24px' : 'left: 24px'};
      bottom: 96px;
      width: 360px; height: 560px;
      background: ${C.bg};
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.45);
      display: none; flex-direction: column;
      z-index: 2147483647;
      border: 1px solid ${C.border};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${C.text};
    }
    #ama-window.open {
      display: flex;
      animation: ama-slide-up .3s ease;
    }
    @keyframes ama-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(.95); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
    #ama-header {
      background: linear-gradient(90deg, ${C.accent}, ${C.accentLight});
      padding: 14px 16px;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    #ama-avatar {
      width: 40px; height: 40px;
      background: linear-gradient(135deg,#ffd700,#ff8c00);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    #ama-header-info h4 { margin: 0; font-size: 15px; color: #fff; }
    #ama-header-info p  { margin: 0; font-size: 11px; color: rgba(255,255,255,.8); }
    #ama-close {
      margin-left: auto;
      background: rgba(255,255,255,.2); border: none;
      width: 30px; height: 30px; border-radius: 50%;
      color: #fff; font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    #ama-close:hover { background: rgba(255,255,255,.35); }
    #ama-quick {
      padding: 8px 12px;
      background: ${C.surface};
      display: flex; gap: 6px; overflow-x: auto;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    #ama-quick::-webkit-scrollbar { display: none; }
    .ama-quick-btn {
      padding: 6px 12px;
      border: none; border-radius: 14px;
      background: ${C.surface2};
      color: ${C.text};
      font-size: 12px; cursor: pointer; white-space: nowrap;
      transition: background .2s;
    }
    .ama-quick-btn:hover { background: linear-gradient(135deg,${C.accent},${C.accentLight}); color: #fff; }
    #ama-messages {
      flex: 1; overflow-y: auto;
      padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    #ama-messages::-webkit-scrollbar { width: 3px; }
    #ama-messages::-webkit-scrollbar-thumb { background: ${C.accent}; border-radius: 2px; }
    .ama-msg {
      max-width: 82%; padding: 10px 14px;
      border-radius: 16px; line-height: 1.5;
      animation: ama-msg-in .25s ease;
    }
    @keyframes ama-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    .ama-msg.agent {
      background: ${C.agentBubble};
      color: ${C.text};
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ama-msg.user {
      background: ${C.userBubble};
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ama-msg .ama-time {
      font-size: 10px; opacity: .55; margin-top: 4px; text-align: right;
    }
    .ama-typing {
      display: flex; gap: 4px; align-items: center;
      padding: 10px 14px;
      background: ${C.agentBubble};
      border-radius: 16px; border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .ama-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${C.textMuted};
      animation: ama-dot 1.2s infinite;
    }
    .ama-typing span:nth-child(2) { animation-delay: .2s; }
    .ama-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes ama-dot {
      0%,80%,100% { transform: scale(.8); opacity: .5; }
      40%          { transform: scale(1.2); opacity: 1; }
    }
    #ama-input-row {
      padding: 10px 14px;
      background: ${C.surface};
      border-top: 1px solid ${C.border};
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0;
    }
    #ama-input {
      flex: 1; padding: 9px 14px;
      border: 1.5px solid ${C.border};
      border-radius: 20px;
      background: ${C.inputBg};
      color: ${C.text};
      font-size: 13px; outline: none;
      transition: border-color .2s;
    }
    #ama-input:focus { border-color: ${C.accent}; }
    #ama-input::placeholder { color: ${C.textMuted}; }
    #ama-send {
      width: 38px; height: 38px; border: none; border-radius: 50%;
      background: linear-gradient(135deg,${C.accent},${C.accentLight});
      color: #fff; font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s;
      flex-shrink: 0;
    }
    #ama-send:hover { transform: scale(1.08); }
    #ama-sms-stack {
      position: fixed;
      ${isRight ? 'right: 24px' : 'left: 24px'};
      bottom: 96px;
      width: 300px;
      display: flex; flex-direction: column-reverse; gap: 8px;
      z-index: 2147483645;
      pointer-events: none;
    }
    .ama-sms {
      background: ${C.surface};
      border: 1px solid ${C.border};
      border-radius: 16px 16px 4px 16px;
      padding: 10px 14px;
      color: ${C.text};
      font-size: 13px; line-height: 1.4;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      animation: ama-sms-in .35s ease;
      pointer-events: auto;
      max-width: 280px;
      ${isRight ? 'margin-left: auto' : 'margin-right: auto'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    @keyframes ama-sms-in {
      from { opacity: 0; transform: translateX(${isRight ? '40px' : '-40px'}) scale(.85); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    .ama-sms.fade-out {
      animation: ama-sms-out .3s ease forwards;
    }
    @keyframes ama-sms-out {
      to { opacity: 0; transform: translateX(${isRight ? '40px' : '-40px'}) scale(.85); }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── DOM ────────────────────────────────────────────────────────────────────

  function buildDOM() {
    // Bubble
    const bubble = document.createElement('div');
    bubble.id = 'ama-bubble';
    bubble.innerHTML = '🎌<div id="ama-badge"></div>';
    bubble.addEventListener('click', toggle);
    document.body.appendChild(bubble);

    // SMS stack
    const smsStack = document.createElement('div');
    smsStack.id = 'ama-sms-stack';
    document.body.appendChild(smsStack);

    // Chat window
    const win = document.createElement('div');
    win.id = 'ama-window';
    win.innerHTML = `
      <div id="ama-header">
        <div id="ama-avatar">🎌</div>
        <div id="ama-header-info">
          <h4>Anime Agent</h4>
          <p>${escHtml(CONFIG.siteName)} • AI Assistant</p>
        </div>
        <button id="ama-close" title="Close">✕</button>
      </div>
      <div id="ama-quick">
        <button class="ama-quick-btn" data-msg="What's airing this season?">📅 Airing Now</button>
        <button class="ama-quick-btn" data-msg="Give me a recommendation">🎯 Recommend</button>
        <button class="ama-quick-btn" data-msg="What's trending right now?">🔥 Trending</button>
        <button class="ama-quick-btn" data-msg="Show me the weekly schedule">📆 Schedule</button>
        <button class="ama-quick-btn" data-msg="What are some hidden gems?">💎 Hidden Gems</button>
      </div>
      <div id="ama-messages"></div>
      <div id="ama-input-row">
        <input id="ama-input" type="text" placeholder="Ask about anime, manga, what's airing…" autocomplete="off" />
        <button id="ama-send" title="Send">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    // Events
    win.querySelector('#ama-close').addEventListener('click', close);
    win.querySelector('#ama-send').addEventListener('click', handleSend);
    win.querySelector('#ama-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    win.querySelectorAll('.ama-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.dataset.msg));
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollBottom() {
    const msgs = document.getElementById('ama-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Widget open/close ──────────────────────────────────────────────────────

  function open() {
    if (isOpen) return;
    isOpen = true;
    document.getElementById('ama-bubble').classList.add('open');
    document.getElementById('ama-window').classList.add('open');
    clearBadge();
    scrollBottom();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.getElementById('ama-bubble').classList.remove('open');
    document.getElementById('ama-window').classList.remove('open');
  }

  function toggle() { isOpen ? close() : open(); }

  // ── Badge ──────────────────────────────────────────────────────────────────

  function showBadge(n) {
    const badge = document.getElementById('ama-badge');
    if (!badge) return;
    notifCount = n;
    badge.textContent = n > 9 ? '9+' : n;
    badge.style.display = n > 0 ? 'flex' : 'none';
  }

  function clearBadge() { showBadge(0); }

  // ── Messages ───────────────────────────────────────────────────────────────

  function appendMessage(text, role) {
    const msgs = document.getElementById('ama-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `ama-msg ${role}`;
    div.innerHTML = `${escHtml(text)}<div class="ama-time">${now()}</div>`;
    msgs.appendChild(div);
    scrollBottom();
  }

  function showTyping() {
    const msgs = document.getElementById('ama-messages');
    if (!msgs) return;
    const el = document.createElement('div');
    el.className = 'ama-typing';
    el.id = 'ama-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('ama-typing-indicator');
    if (el) el.remove();
  }

  // ── SMS notifications ──────────────────────────────────────────────────────

  function showSMS(text, duration) {
    if (isOpen) return; // don't show SMS when chat is open
    const stack = document.getElementById('ama-sms-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'ama-sms';
    el.textContent = text;
    stack.appendChild(el);
    showBadge(notifCount + 1);

    const ms = duration || 5000;
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 350);
    }, ms);
  }

  // ── API calls ──────────────────────────────────────────────────────────────

  async function apiPost(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.token) headers['Authorization'] = `Bearer ${CONFIG.token}`;
    const res = await fetch(`${CONFIG.apiUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async function apiGet(path) {
    const headers = {};
    if (CONFIG.token) headers['Authorization'] = `Bearer ${CONFIG.token}`;
    const res = await fetch(`${CONFIG.apiUrl}${path}`, { headers });
    return res.json();
  }

  // ── Send message ───────────────────────────────────────────────────────────

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    if (!isOpen) open();

    appendMessage(text, 'user');
    showTyping();

    try {
      const body = {
        message: text,
        language: CONFIG.lang,
      };
      // Attach the website's anime list for context if available
      if (animeList.length > 0) {
        body.website_anime_list = animeList;
      }

      const data = await apiPost('/api/chat', body);
      hideTyping();

      const reply = (data && data.message) ? data.message : '…';
      appendMessage(reply, 'agent');
    } catch (err) {
      hideTyping();
      appendMessage('⚠️ Could not reach the agent. Is the server running?', 'agent');
    }
  }

  function handleSend() {
    const input = document.getElementById('ama-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text);
  }

  // ── Activity tracking ──────────────────────────────────────────────────────

  async function trackActivity(type, data) {
    try {
      const res = await apiPost('/api/activity', {
        type,
        data: data || {},
        timestamp: new Date().toISOString()
      });
      if (res && res.message) {
        showSMS(res.message);
      }
    } catch (_) { /* silent */ }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  window.AnimeMangaAgent = {
    /** Open the chat window */
    open,
    /** Close the chat window */
    close,
    /** Toggle the chat window */
    toggle,
    /**
     * Send a message to the agent programmatically.
     * @param {string} message
     */
    sendMessage,
    /**
     * Update the JWT auth token (call after user logs in on your site).
     * @param {string} token
     */
    setToken(token) { CONFIG.token = token; },
    /**
     * Push your site's anime list so the agent can use it as context.
     * @param {Array<{mal_id?, title, status?, score?, episodes_watched?}>} list
     */
    setAnimeList(list) { animeList = Array.isArray(list) ? list : []; },
    /**
     * Notify the agent of a user action on your site.
     * Supported types: add_watchlist, remove_watchlist, complete_anime,
     *   complete_manga, rate_anime, browse_seasonal, search_anime,
     *   view_details, save_link, idle, new_episode, login, logout
     * @param {string} type
     * @param {object} data
     */
    trackActivity,
    /**
     * Show an SMS-style notification bubble.
     * @param {string} text
     * @param {number} [duration=5000] ms before auto-dismiss
     */
    notify: showSMS,
    /**
     * Fetch currently airing anime (Jikan).
     * @param {object} [opts] { limit, page }
     * @returns {Promise<object>}
     */
    getAiringNow(opts) {
      const p = new URLSearchParams(opts || {});
      return apiGet(`/api/airing/now?${p}`);
    },
    /**
     * Fetch the weekly airing schedule (Jikan).
     * @param {string} [day] monday|tuesday|…  (omit for full week)
     * @returns {Promise<object>}
     */
    getSchedule(day) {
      return apiGet(`/api/airing/schedule${day ? `?day=${day}` : ''}`);
    },
    /**
     * Fetch seasonal anime via AniList/AniChart.
     * @param {object} [opts] { season, year, page, per_page }
     * @returns {Promise<object>}
     */
    getAniChartSeason(opts) {
      const p = new URLSearchParams(opts || {});
      return apiGet(`/api/airing/anichart?${p}`);
    },
    /**
     * Search anime.
     * @param {string} query
     * @param {number} [limit=25]
     * @returns {Promise<object>}
     */
    searchAnime(query, limit) {
      return apiGet(`/api/search/anime?q=${encodeURIComponent(query)}&limit=${limit || 25}`);
    },
    /**
     * Get trending anime.
     * @returns {Promise<object>}
     */
    getTrending() { return apiGet('/api/trends?type=anime'); },
    /**
     * Get current season info.
     * @returns {Promise<object>}
     */
    getCurrentSeason() { return apiGet('/api/season/current'); },
  };

  // ── Greeting on first open ─────────────────────────────────────────────────

  async function greet() {
    try {
      const data = await apiGet(`/api/personality/greeting?lang=${CONFIG.lang}`);
      if (data && data.data && data.data.greeting) {
        appendMessage(data.data.greeting, 'agent');
      } else {
        appendMessage('🎌 Konnichiwa! Ask me anything about anime or manga!', 'agent');
      }
    } catch (_) {
      appendMessage('🎌 Konnichiwa! Ask me anything about anime or manga!', 'agent');
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function init() {
    buildDOM();
    // Show greeting after a short delay
    setTimeout(greet, 800);
    // Show a teaser SMS after 3 seconds if chat is not open
    setTimeout(() => {
      if (!isOpen) {
        showSMS('🎌 Hi! I can tell you what\'s airing this season. Click me!');
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
