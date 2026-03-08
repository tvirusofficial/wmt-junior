const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WMT Junior — Admin</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #7c6af7;
    --accent2: #f76a8a;
    --accent3: #6af7c4;
    --text: #e8e8f0;
    --text2: #8888aa;
    --text3: #4a4a6a;
    --user-bubble: #1e1e2e;
    --bot-bubble: #1a1a30;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── LOGIN ─────────────────────────────── */
  #login-screen {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg);
    z-index: 100;
  }
  .login-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px 40px;
    width: 360px;
    text-align: center;
  }
  .login-logo { font-size: 40px; margin-bottom: 12px; }
  .login-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px; font-weight: 600;
    color: var(--accent); margin-bottom: 4px;
  }
  .login-sub { font-size: 13px; color: var(--text2); margin-bottom: 32px; }
  .login-input {
    width: 100%; padding: 12px 16px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-family: 'IBM Plex Mono', monospace; font-size: 14px;
    outline: none; margin-bottom: 12px;
    transition: border-color .2s;
  }
  .login-input:focus { border-color: var(--accent); }
  .login-btn {
    width: 100%; padding: 12px;
    background: var(--accent); border: none;
    border-radius: 8px; color: #fff;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: opacity .2s;
  }
  .login-btn:hover { opacity: .85; }
  .login-err { color: var(--accent2); font-size: 12px; margin-top: 8px; display: none; }

  /* ── HEADER ─────────────────────────────── */
  header {
    display: flex; align-items: center; gap: 12px;
    padding: 0 24px; height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .header-logo { font-size: 22px; }
  .header-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 15px; font-weight: 600; color: var(--accent);
  }
  .header-badge {
    font-size: 10px; padding: 2px 8px;
    background: rgba(124,106,247,.15);
    border: 1px solid rgba(124,106,247,.3);
    border-radius: 20px; color: var(--accent);
    font-family: 'IBM Plex Mono', monospace;
  }
  .header-right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent3);
    box-shadow: 0 0 6px var(--accent3);
  }
  .status-text { font-size: 12px; color: var(--text2); }

  /* ── LAYOUT ─────────────────────────────── */
  .app { display: flex; flex: 1; overflow: hidden; }

  /* ── SIDEBAR ─────────────────────────────── */
  nav {
    width: 200px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 16px 0;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 20px; cursor: pointer;
    font-size: 13px; color: var(--text2);
    transition: all .15s; border-left: 2px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: rgba(255,255,255,.03); }
  .nav-item.active {
    color: var(--accent); background: rgba(124,106,247,.08);
    border-left-color: var(--accent);
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-section {
    font-size: 10px; font-family: 'IBM Plex Mono', monospace;
    color: var(--text3); padding: 16px 20px 6px;
    letter-spacing: .08em; text-transform: uppercase;
  }

  /* ── MAIN ─────────────────────────────── */
  main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

  .tab-content { display: none; flex: 1; overflow: hidden; flex-direction: column; }
  .tab-content.active { display: flex; }

  .panel-header {
    padding: 20px 24px 0;
    display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  }
  .panel-title { font-size: 16px; font-weight: 600; }
  .panel-sub { font-size: 12px; color: var(--text2); margin-left: auto; }

  /* ── CHAT LOG ─────────────────────────────── */
  #tab-chats .chat-filters {
    padding: 12px 24px; display: flex; gap: 8px; flex-shrink: 0;
  }
  .filter-input {
    flex: 1; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-size: 13px;
    font-family: 'IBM Plex Sans', sans-serif; outline: none;
  }
  .filter-input:focus { border-color: var(--accent); }
  .btn-sm {
    padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface2); color: var(--text2);
    font-size: 12px; cursor: pointer; transition: all .15s;
    font-family: 'IBM Plex Sans', sans-serif;
  }
  .btn-sm:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm.primary {
    background: var(--accent); border-color: var(--accent);
    color: #fff;
  }
  .btn-sm.primary:hover { opacity: .85; }
  .btn-sm.danger { border-color: rgba(247,106,138,.3); color: var(--accent2); }
  .btn-sm.danger:hover { background: rgba(247,106,138,.1); }

  .chat-log-list {
    flex: 1; overflow-y: auto; padding: 0 24px 24px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .chat-msg {
    display: flex; gap: 10px; align-items: flex-start;
  }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; margin-top: 2px;
  }
  .chat-avatar.user-av { background: rgba(247,106,138,.15); border: 1px solid rgba(247,106,138,.3); }
  .chat-avatar.bot-av { background: rgba(124,106,247,.15); border: 1px solid rgba(124,106,247,.3); }
  .chat-bubble {
    max-width: 65%; padding: 10px 14px;
    border-radius: 12px; font-size: 13px; line-height: 1.6;
  }
  .user .chat-bubble {
    background: var(--user-bubble);
    border: 1px solid rgba(247,106,138,.2);
    border-top-right-radius: 4px;
  }
  .bot .chat-bubble {
    background: var(--bot-bubble);
    border: 1px solid rgba(124,106,247,.2);
    border-top-left-radius: 4px;
  }
  .chat-time { font-size: 10px; color: var(--text3); margin-top: 4px; }
  .user .chat-time { text-align: right; }

  .date-divider {
    text-align: center; font-size: 11px; color: var(--text3);
    font-family: 'IBM Plex Mono', monospace;
    padding: 8px 0;
  }
  .empty-state {
    flex: 1; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 8px; color: var(--text3);
  }
  .empty-icon { font-size: 32px; }
  .empty-text { font-size: 13px; }

  /* ── KNOWLEDGE BASE ─────────────────────────────── */
  #tab-kb .kb-body {
    flex: 1; overflow-y: auto;
    padding: 0 24px 24px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .kb-toolbar { padding: 12px 24px; display: flex; gap: 8px; flex-shrink: 0; }
  .kb-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px;
    transition: border-color .15s;
  }
  .kb-card:hover { border-color: var(--accent); }
  .kb-cat-badge {
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-family: 'IBM Plex Mono', monospace;
    flex-shrink: 0; margin-top: 2px;
  }
  .cat-job { background: rgba(106,247,196,.1); color: var(--accent3); border: 1px solid rgba(106,247,196,.25); }
  .cat-hobby { background: rgba(124,106,247,.1); color: var(--accent); border: 1px solid rgba(124,106,247,.25); }
  .cat-memory { background: rgba(247,106,138,.1); color: var(--accent2); border: 1px solid rgba(247,106,138,.25); }
  .cat-personality { background: rgba(247,196,106,.1); color: #f7c46a; border: 1px solid rgba(247,196,106,.25); }
  .cat-other { background: rgba(136,136,170,.1); color: var(--text2); border: 1px solid rgba(136,136,170,.25); }
  .kb-info { flex: 1; }
  .kb-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
  .kb-content { font-size: 12px; color: var(--text2); line-height: 1.5; }
  .kb-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .icon-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid var(--border); background: transparent;
    color: var(--text2); cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 13px;
    transition: all .15s;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
  .icon-btn.del:hover { border-color: var(--accent2); color: var(--accent2); }

  /* ── MODAL ─────────────────────────────── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
    z-index: 50; display: none;
    align-items: center; justify-content: center;
  }
  .modal-overlay.open { display: flex; }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 28px;
    width: 460px; max-width: 95vw;
  }
  .modal-title {
    font-size: 15px; font-weight: 600; margin-bottom: 20px;
    font-family: 'IBM Plex Mono', monospace; color: var(--accent);
  }
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 11px; color: var(--text2); margin-bottom: 6px; display: block;
    font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: .06em; }
  .form-control {
    width: 100%; padding: 10px 12px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-size: 13px;
    font-family: 'IBM Plex Sans', sans-serif; outline: none;
    transition: border-color .2s;
  }
  .form-control:focus { border-color: var(--accent); }
  textarea.form-control { resize: vertical; min-height: 80px; }
  select.form-control option { background: var(--surface); }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

  /* ── SCHEDULE ─────────────────────────────── */
  #tab-schedule .sch-body {
    flex: 1; overflow-y: auto; padding: 0 24px 24px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .sch-toolbar { padding: 12px 24px; display: flex; gap: 8px; flex-shrink: 0; }
  .sch-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px;
    display: flex; gap: 12px; align-items: flex-start;
    transition: border-color .15s;
  }
  .sch-card:hover { border-color: rgba(106,247,196,.3); }
  .sch-card.sent { opacity: .5; }
  .sch-time-box {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 12px; text-align: center;
    flex-shrink: 0; min-width: 80px;
  }
  .sch-date { font-size: 10px; color: var(--text3); font-family: 'IBM Plex Mono', monospace; }
  .sch-time { font-size: 14px; font-weight: 600; font-family: 'IBM Plex Mono', monospace; color: var(--accent3); }
  .sch-info { flex: 1; }
  .sch-msg { font-size: 13px; margin-bottom: 4px; }
  .sch-ctx { font-size: 11px; color: var(--text2); font-style: italic; }
  .sch-status {
    font-size: 10px; padding: 2px 8px; border-radius: 20px;
    font-family: 'IBM Plex Mono', monospace; flex-shrink: 0;
  }
  .status-pending {
    background: rgba(106,247,196,.1); color: var(--accent3);
    border: 1px solid rgba(106,247,196,.25);
  }
  .status-sent {
    background: rgba(136,136,170,.1); color: var(--text3);
    border: 1px solid rgba(136,136,170,.2);
  }

  /* ── CONFIG ─────────────────────────────── */
  #tab-config .cfg-body {
    flex: 1; overflow-y: auto; padding: 0 24px 24px;
  }
  .cfg-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 12px;
  }
  .cfg-key {
    font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    color: var(--accent); min-width: 160px;
  }
  .cfg-val { flex: 1; font-size: 13px; color: var(--text2); }
  .cfg-desc { font-size: 11px; color: var(--text3); }
  .toggle {
    width: 40px; height: 22px; background: var(--border);
    border-radius: 11px; cursor: pointer; position: relative;
    transition: background .2s; flex-shrink: 0;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: ''; position: absolute;
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; top: 3px; left: 3px;
    transition: transform .2s;
  }
  .toggle.on::after { transform: translateX(18px); }

  /* ── SCROLLBAR ─────────────────────────────── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── LOADING ─────────────────────────────── */
  .loading {
    display: flex; align-items: center; justify-content: center;
    padding: 40px; color: var(--text3); font-size: 13px; gap: 8px;
  }
  .spin {
    width: 16px; height: 16px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 10px 16px; border-radius: 8px;
    font-size: 13px; z-index: 200;
    background: var(--surface2); border: 1px solid var(--border);
    transform: translateY(80px); opacity: 0;
    transition: all .25s; pointer-events: none;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast.success { border-color: var(--accent3); color: var(--accent3); }
  .toast.error { border-color: var(--accent2); color: var(--accent2); }
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login-screen">
  <div class="login-box">
    <div class="login-logo">🤖</div>
    <div class="login-title">WMT Junior</div>
    <div class="login-sub">Admin Panel</div>
    <input type="password" id="token-input" class="login-input" placeholder="Admin token ထည့်ပါ" />
    <button class="login-btn" onclick="doLogin()">ဝင်မည်</button>
    <div class="login-err" id="login-err">Token မမှန်ကန်ပါ</div>
  </div>
</div>

<!-- HEADER -->
<header>
  <div class="header-logo">🤖</div>
  <div class="header-title">WMT Junior</div>
  <div class="header-badge">Admin</div>
  <div class="header-right">
    <div class="status-dot"></div>
    <div class="status-text">Live</div>
  </div>
</header>

<!-- APP -->
<div class="app">
  <!-- NAV -->
  <nav>
    <div class="nav-section">Monitor</div>
    <div class="nav-item active" onclick="switchTab('chats', this)">
      <span class="nav-icon">💬</span> Chat Logs
    </div>
    <div class="nav-section">Manage</div>
    <div class="nav-item" onclick="switchTab('kb', this)">
      <span class="nav-icon">📚</span> Knowledge Base
    </div>
    <div class="nav-item" onclick="switchTab('schedule', this)">
      <span class="nav-icon">⏰</span> Schedules
    </div>
    <div class="nav-section">System</div>
    <div class="nav-item" onclick="switchTab('config', this)">
      <span class="nav-icon">⚙️</span> Config
    </div>
  </nav>

  <!-- MAIN -->
  <main>

    <!-- CHAT LOGS TAB -->
    <div id="tab-chats" class="tab-content active">
      <div class="panel-header">
        <div class="panel-title">💬 Chat Logs</div>
        <div class="panel-sub" id="chat-count">Loading...</div>
        <button class="btn-sm" onclick="loadChats()" style="margin-left:8px">↻ Refresh</button>
      </div>
      <div class="chat-filters">
        <input type="text" class="filter-input" id="chat-search" placeholder="Search messages..." oninput="filterChats()">
      </div>
      <div class="chat-log-list" id="chat-log-list">
        <div class="loading"><div class="spin"></div> Loading...</div>
      </div>
    </div>

    <!-- KB TAB -->
    <div id="tab-kb" class="tab-content">
      <div class="panel-header">
        <div class="panel-title">📚 Knowledge Base</div>
        <div class="panel-sub" id="kb-count"></div>
      </div>
      <div class="kb-toolbar">
        <select class="filter-input" id="kb-filter" onchange="filterKB()" style="max-width:160px">
          <option value="">All Categories</option>
          <option value="job">Job</option>
          <option value="hobby">Hobby</option>
          <option value="memory">Memory</option>
          <option value="personality">Personality</option>
          <option value="other">Other</option>
        </select>
        <button class="btn-sm primary" onclick="openKBModal()">+ Add Entry</button>
      </div>
      <div class="kb-body" id="kb-list">
        <div class="loading"><div class="spin"></div> Loading...</div>
      </div>
    </div>

    <!-- SCHEDULE TAB -->
    <div id="tab-schedule" class="tab-content">
      <div class="panel-header">
        <div class="panel-title">⏰ Scheduled Messages</div>
        <div class="panel-sub" id="sch-count"></div>
      </div>
      <div class="sch-toolbar">
        <button class="btn-sm primary" onclick="openSchModal()">+ Add Schedule</button>
        <button class="btn-sm" onclick="loadSchedules()">↻ Refresh</button>
      </div>
      <div class="sch-body" id="sch-list">
        <div class="loading"><div class="spin"></div> Loading...</div>
      </div>
    </div>

    <!-- CONFIG TAB -->
    <div id="tab-config" class="tab-content">
      <div class="panel-header">
        <div class="panel-title">⚙️ Bot Config</div>
      </div>
      <div class="cfg-body" id="cfg-body" style="padding-top:16px">
        <div class="loading"><div class="spin"></div> Loading...</div>
      </div>
    </div>

  </main>
</div>

<!-- KB MODAL -->
<div class="modal-overlay" id="kb-modal">
  <div class="modal">
    <div class="modal-title" id="kb-modal-title">Add KB Entry</div>
    <input type="hidden" id="kb-edit-id">
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-control" id="kb-cat">
        <option value="job">Job / ကုမ္ပဏီ</option>
        <option value="hobby">Hobby / ဝါသနာ</option>
        <option value="memory">Memory</option>
        <option value="personality">Personality</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Title</label>
      <input type="text" class="form-control" id="kb-title" placeholder="e.g. ကုမ္ပဏီ အမည်">
    </div>
    <div class="form-group">
      <label class="form-label">Content</label>
      <textarea class="form-control" id="kb-content" placeholder="Detail ထည့်ပါ..."></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-sm" onclick="closeModal('kb-modal')">Cancel</button>
      <button class="btn-sm primary" onclick="saveKB()">Save</button>
    </div>
  </div>
</div>

<!-- SCHEDULE MODAL -->
<div class="modal-overlay" id="sch-modal">
  <div class="modal">
    <div class="modal-title">Add Scheduled Message</div>
    <div class="form-group">
      <label class="form-label">Send At (Myanmar Time)</label>
      <input type="datetime-local" class="form-control" id="sch-time">
    </div>
    <div class="form-group">
      <label class="form-label">Message / Prompt</label>
      <textarea class="form-control" id="sch-msg" placeholder="Bot က မမကို ဘာပြောမည်..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Context (Admin မှတ်ချက်)</label>
      <textarea class="form-control" id="sch-ctx" placeholder="ဥပမာ: မနေ့က နေမကောင်းဘူးဆိုလို့ follow up မေး..." style="min-height:60px"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-sm" onclick="closeModal('sch-modal')">Cancel</button>
      <button class="btn-sm primary" onclick="saveSchedule()">Schedule</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<script>
const WORKER_URL = window.location.origin;
let TOKEN = '';
let allChats = [];
let allKB = [];
let allSchedules = [];

// ── AUTH ────────────────────────────────────────────────────
function doLogin() {
  const val = document.getElementById('token-input').value.trim();
  if (!val) return;
  TOKEN = val;
  localStorage.setItem('wmt_token', val);
  initApp();
}

async function initApp() {
  // Test token
  // Test auth with chats endpoint
  const res = await apiFetch('/api/chats');
  if (!res.ok) {
    document.getElementById('login-err').style.display = 'block';
    TOKEN = '';
    return;
  }
  document.getElementById('login-screen').style.display = 'none';
  allChats = await res.json();
  renderChats(allChats);
  loadKB();
  loadSchedules();
  loadConfig();
}

// ── API ────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  return fetch(WORKER_URL + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${TOKEN}\`,
      ...(opts.headers || {})
    }
  });
}

// ── TABS ────────────────────────────────────────────────────
function switchTab(name, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
}

// ── CHAT LOGS ────────────────────────────────────────────────
async function loadChats() {
  const res = await apiFetch('/api/chats');
  if (!res.ok) return;
  allChats = await res.json();
  renderChats(allChats);
}

function renderChats(logs) {
  const el = document.getElementById('chat-log-list');
  document.getElementById('chat-count').textContent = \`\${logs.length} messages\`;

  if (!logs.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-text">No messages yet</div></div>';
    return;
  }

  // Group by date
  const grouped = {};
  [...logs].reverse().forEach(log => {
    const d = new Date(log.created_at).toLocaleDateString('en-GB');
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(log);
  });

  let html = '';
  for (const [date, msgs] of Object.entries(grouped)) {
    html += \`<div class="date-divider">── \${date} ──</div>\`;
    msgs.forEach(m => {
      const isUser = m.role === 'user';
      const time = new Date(m.created_at).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
      html += \`
        <div class="chat-msg \${isUser ? 'user' : 'bot'}">
          <div class="chat-avatar \${isUser ? 'user-av' : 'bot-av'}">\${isUser ? '👩' : '🤖'}</div>
          <div>
            <div class="chat-bubble">\${escHtml(m.message)}</div>
            <div class="chat-time">\${time}</div>
          </div>
        </div>\`;
    });
  }
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

function filterChats() {
  const q = document.getElementById('chat-search').value.toLowerCase();
  renderChats(q ? allChats.filter(c => c.message.toLowerCase().includes(q)) : allChats);
}

// ── KNOWLEDGE BASE ────────────────────────────────────────────
async function loadKB() {
  const res = await apiFetch('/api/kb');
  if (!res.ok) return;
  allKB = await res.json();
  renderKB(allKB);
}

const catColors = { job:'cat-job', hobby:'cat-hobby', memory:'cat-memory', personality:'cat-personality', other:'cat-other' };
const catLabels = { job:'Job', hobby:'Hobby', memory:'Memory', personality:'Personality', other:'Other' };

function renderKB(items) {
  const el = document.getElementById('kb-list');
  document.getElementById('kb-count').textContent = \`\${items.length} entries\`;
  if (!items.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">No entries yet</div></div>';
    return;
  }
  el.innerHTML = items.map(kb => \`
    <div class="kb-card">
      <div class="kb-cat-badge \${catColors[kb.category]||'cat-other'}">\${catLabels[kb.category]||kb.category}</div>
      <div class="kb-info">
        <div class="kb-title">\${escHtml(kb.title)}</div>
        <div class="kb-content">\${escHtml(kb.content)}</div>
      </div>
      <div class="kb-actions">
        <button class="icon-btn" onclick="editKB('\${kb.id}')" title="Edit">✏️</button>
        <button class="icon-btn del" onclick="deleteKB('\${kb.id}')" title="Delete">🗑</button>
      </div>
    </div>\`).join('');
}

function filterKB() {
  const cat = document.getElementById('kb-filter').value;
  renderKB(cat ? allKB.filter(k => k.category === cat) : allKB);
}

function openKBModal(id) {
  document.getElementById('kb-edit-id').value = '';
  document.getElementById('kb-modal-title').textContent = 'Add KB Entry';
  document.getElementById('kb-cat').value = 'job';
  document.getElementById('kb-title').value = '';
  document.getElementById('kb-content').value = '';
  document.getElementById('kb-modal').classList.add('open');
}

function editKB(id) {
  const kb = allKB.find(k => k.id === id);
  if (!kb) return;
  document.getElementById('kb-edit-id').value = id;
  document.getElementById('kb-modal-title').textContent = 'Edit KB Entry';
  document.getElementById('kb-cat').value = kb.category;
  document.getElementById('kb-title').value = kb.title;
  document.getElementById('kb-content').value = kb.content;
  document.getElementById('kb-modal').classList.add('open');
}

async function saveKB() {
  const id = document.getElementById('kb-edit-id').value;
  const body = {
    category: document.getElementById('kb-cat').value,
    title: document.getElementById('kb-title').value.trim(),
    content: document.getElementById('kb-content').value.trim(),
  };
  if (!body.title || !body.content) return showToast('Title နဲ့ Content ထည့်ပါ', 'error');

  const res = await apiFetch(id ? \`/api/kb/\${id}\` : '/api/kb', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) return showToast('Error: ' + await res.text(), 'error');
  closeModal('kb-modal');
  showToast('Saved successfully', 'success');
  loadKB();
}

async function deleteKB(id) {
  if (!confirm('Delete this entry?')) return;
  const res = await apiFetch(\`/api/kb/\${id}\`, { method: 'DELETE' });
  if (!res.ok) return showToast('Delete failed', 'error');
  showToast('Deleted', 'success');
  loadKB();
}

// ── SCHEDULES ────────────────────────────────────────────────
async function loadSchedules() {
  const res = await apiFetch('/api/schedules');
  if (!res.ok) return;
  allSchedules = await res.json();
  renderSchedules(allSchedules);
}

function renderSchedules(items) {
  const el = document.getElementById('sch-list');
  const pending = items.filter(s => !s.is_sent).length;
  document.getElementById('sch-count').textContent = \`\${pending} pending\`;
  if (!items.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">⏰</div><div class="empty-text">No schedules yet</div></div>';
    return;
  }
  el.innerHTML = items.map(s => {
    const d = new Date(s.send_at);
    const date = d.toLocaleDateString('en-GB', {day:'2-digit',month:'short'});
    const time = d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
    return \`
      <div class="sch-card \${s.is_sent ? 'sent' : ''}">
        <div class="sch-time-box">
          <div class="sch-date">\${date}</div>
          <div class="sch-time">\${time}</div>
        </div>
        <div class="sch-info">
          <div class="sch-msg">\${escHtml(s.message)}</div>
          \${s.context ? \`<div class="sch-ctx">📝 \${escHtml(s.context)}</div>\` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div class="sch-status \${s.is_sent ? 'status-sent' : 'status-pending'}">\${s.is_sent ? 'Sent' : 'Pending'}</div>
          \${!s.is_sent ? \`<button class="icon-btn del" onclick="deleteSchedule('\${s.id}')" title="Cancel">✕</button>\` : ''}
        </div>
      </div>\`;
  }).join('');
}

function openSchModal() {
  // Default to current time + 1 hour in local
  const d = new Date(Date.now() + 3600000);
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('sch-time').value =
    \`\${d.getFullYear()}-\${pad(d.getMonth()+1)}-\${pad(d.getDate())}T\${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
  document.getElementById('sch-msg').value = '';
  document.getElementById('sch-ctx').value = '';
  document.getElementById('sch-modal').classList.add('open');
}

async function saveSchedule() {
  const sendAt = document.getElementById('sch-time').value;
  const message = document.getElementById('sch-msg').value.trim();
  const context = document.getElementById('sch-ctx').value.trim();
  if (!sendAt || !message) return showToast('Time နဲ့ Message ထည့်ပါ', 'error');

  const res = await apiFetch('/api/schedules', {
    method: 'POST',
    body: JSON.stringify({
      target_user_id: null, // Will use ALLOWED_USER_IDS first user
      message, context,
      send_at: new Date(sendAt).toISOString()
    })
  });
  if (!res.ok) return showToast('Error: ' + await res.text(), 'error');
  closeModal('sch-modal');
  showToast('Scheduled', 'success');
  loadSchedules();
}

async function deleteSchedule(id) {
  if (!confirm('Cancel this schedule?')) return;
  const res = await apiFetch(\`/api/schedules/\${id}\`, { method: 'DELETE' });
  if (!res.ok) return showToast('Error', 'error');
  showToast('Cancelled', 'success');
  loadSchedules();
}

// ── CONFIG ────────────────────────────────────────────────────
async function loadConfig() {
  const res = await apiFetch('/api/config');
  if (!res.ok) return;
  const configs = await res.json();
  const el = document.getElementById('cfg-body');
  el.innerHTML = configs.map(c => \`
    <div class="cfg-card">
      <div class="cfg-key">\${escHtml(c.key)}</div>
      <div style="flex:1">
        <div class="cfg-val">\${escHtml(c.value)}</div>
        \${c.description ? \`<div class="cfg-desc">\${escHtml(c.description)}</div>\` : ''}
      </div>
      \${c.key === 'greeting_enabled' ? \`
        <div class="toggle \${c.value === 'true' ? 'on' : ''}" onclick="toggleConfig('\${c.key}', this)"></div>
      \` : \`
        <button class="btn-sm" onclick="editConfig('\${c.key}', '\${escHtml(c.value)}')">Edit</button>
      \`}
    </div>\`).join('');
}

async function toggleConfig(key, el) {
  const isOn = el.classList.contains('on');
  el.classList.toggle('on');
  const res = await apiFetch('/api/config', {
    method: 'PATCH',
    body: JSON.stringify({ key, value: isOn ? 'false' : 'true' })
  });
  if (!res.ok) { el.classList.toggle('on'); showToast('Error', 'error'); }
  else showToast('Updated', 'success');
}

async function editConfig(key, val) {
  const newVal = prompt(\`\${key} ကို ပြင်မည်:\`, val);
  if (newVal === null) return;
  const res = await apiFetch('/api/config', {
    method: 'PATCH',
    body: JSON.stringify({ key, value: newVal })
  });
  if (!res.ok) return showToast('Error', 'error');
  showToast('Updated', 'success');
  loadConfig();
}

// ── UTILS ────────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = \`toast \${type} show\`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── INIT ────────────────────────────────────────────────────
const saved = localStorage.getItem('wmt_token');
if (saved) { TOKEN = saved; initApp(); }
</script>
</body>
</html>
`;
export default ADMIN_HTML;
