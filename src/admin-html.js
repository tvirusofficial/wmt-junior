const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>WMT Junior — Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Myanmar:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#080810;--s1:#0f0f1a;--s2:#16162a;--s3:#1e1e35;--border:#252540;--border2:#2e2e50;--acc:#8b7cf8;--acc-dim:rgba(139,124,248,.12);--acc-glow:rgba(139,124,248,.25);--pink:#f472b6;--pink-dim:rgba(244,114,182,.12);--teal:#2dd4bf;--teal-dim:rgba(45,212,191,.12);--amber:#fbbf24;--t1:#f0f0ff;--t2:#9090bb;--t3:#505075;--t4:#30304a;--r:10px;--sidebar:220px;}
*{margin:0;padding:0;box-sizing:border-box;}html,body{height:100%;overflow:hidden;}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--t1);-webkit-font-smoothing:antialiased;}
#login-screen{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:var(--bg);}
.login-wrap{width:100%;max-width:380px;padding:20px;}
.login-card{background:var(--s1);border:1px solid var(--border2);border-radius:20px;padding:44px 36px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.5);}
.login-icon{width:64px;height:64px;border-radius:16px;background:var(--acc-dim);border:1px solid var(--acc-glow);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;}
.login-name{font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--acc);margin-bottom:4px;}
.login-sub{font-size:13px;color:var(--t3);margin-bottom:32px;}
.inp{width:100%;padding:12px 16px;background:var(--bg);border:1px solid var(--border2);border-radius:10px;color:var(--t1);font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;margin-bottom:10px;}
.inp:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-dim);}
.btn{width:100%;padding:13px;border:none;border-radius:10px;background:var(--acc);color:#fff;font-family:'Syne',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s;}
.btn:hover{opacity:.9;}
.login-err{font-size:12px;color:var(--pink);margin-top:10px;display:none;}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:var(--sidebar);flex-shrink:0;background:var(--s1);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:transform .25s;}
.sb-hdr{padding:16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;}
.sb-logo{width:34px;height:34px;border-radius:9px;background:var(--acc-dim);border:1px solid var(--acc-glow);display:flex;align-items:center;justify-content:center;font-size:16px;}
.sb-brand{font-size:15px;font-weight:700;color:var(--acc);}
.sb-badge{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;padding:2px 7px;border-radius:20px;background:var(--acc-dim);color:var(--acc);border:1px solid var(--acc-glow);}
.sb-live{padding:9px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);flex-shrink:0;}
.dot{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal);}
.sb-live-txt{font-size:11px;color:var(--t2);}
.sb-sec{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--t4);padding:14px 16px 5px;letter-spacing:.1em;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 16px;cursor:pointer;font-size:13px;color:var(--t2);font-weight:500;border-left:2px solid transparent;transition:all .15s;border-radius:0 8px 8px 0;margin:1px 8px 1px 0;}
.nav-item:hover{color:var(--t1);background:var(--s2);}
.nav-item.active{color:var(--acc);background:var(--acc-dim);border-left-color:var(--acc);}
.nav-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.sb-foot{margin-top:auto;padding:12px 16px;border-top:1px solid var(--border);}
.logout-btn{width:100%;padding:8px;border:1px solid var(--border2);border-radius:8px;background:transparent;color:var(--t3);font-size:12px;cursor:pointer;transition:all .15s;}
.logout-btn:hover{border-color:var(--pink);color:var(--pink);}
.hamburger{display:none;position:fixed;top:12px;left:12px;z-index:150;width:38px;height:38px;border-radius:9px;background:var(--s1);border:1px solid var(--border2);align-items:center;justify-content:center;cursor:pointer;font-size:18px;}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99;backdrop-filter:blur(2px);}
.main{flex:1;overflow:hidden;display:flex;flex-direction:column;min-width:0;}
.tab{display:none;flex:1;overflow:hidden;flex-direction:column;}
.tab.active{display:flex;}
.pg-hdr{padding:18px 20px 0;flex-shrink:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.pg-title{font-size:17px;font-weight:700;letter-spacing:-.3px;}
.pg-meta{font-size:12px;color:var(--t3);font-family:'JetBrains Mono',monospace;margin-left:auto;}
.btn-out{padding:7px 14px;border:1px solid var(--border2);border-radius:8px;background:transparent;color:var(--t2);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;}
.btn-out:hover{border-color:var(--acc);color:var(--acc);}
.btn-pri{padding:7px 14px;border:none;border-radius:8px;background:var(--acc);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .15s;white-space:nowrap;}
.btn-pri:hover{opacity:.85;}
.toolbar{padding:12px 20px;display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;}
.search{flex:1;min-width:140px;padding:9px 14px;background:var(--s2);border:1px solid var(--border);border-radius:9px;color:var(--t1);font-size:13px;font-family:'Syne',sans-serif;outline:none;transition:border-color .2s;}
.search:focus{border-color:var(--acc);}
select.search{cursor:pointer;}
select.search option{background:var(--s1);}
.scroll-body{flex:1;overflow-y:auto;padding:12px 20px 24px;}
.scroll-body::-webkit-scrollbar{width:4px;}
.scroll-body::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
.chat-list{display:flex;flex-direction:column;gap:12px;}
.date-lbl{text-align:center;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--t4);padding:6px 0;position:relative;}
.date-lbl::before,.date-lbl::after{content:'';position:absolute;top:50%;height:1px;background:var(--border);width:calc(50% - 56px);}
.date-lbl::before{left:0;}.date-lbl::after{right:0;}
.msg-row{display:flex;gap:10px;align-items:flex-end;max-width:84%;}
.msg-row.user{flex-direction:row-reverse;margin-left:auto;}
.msg-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.msg-av.bot-av{background:var(--acc-dim);border:1px solid var(--acc-glow);}
.msg-av.usr-av{background:var(--pink-dim);border:1px solid rgba(244,114,182,.3);}
.msg-bubble{padding:10px 14px;font-size:13px;line-height:1.7;font-family:'Noto Sans Myanmar','Syne',sans-serif;word-break:break-word;}
.bot .msg-bubble{background:var(--s2);border:1px solid var(--border);border-radius:14px 14px 14px 4px;}
.user .msg-bubble{background:var(--acc-dim);border:1px solid var(--acc-glow);border-radius:14px 14px 4px 14px;}
.msg-time{font-size:10px;color:var(--t4);padding:3px 4px;font-family:'JetBrains Mono',monospace;}
.user .msg-time{text-align:right;}
.kb-grid{display:flex;flex-direction:column;gap:8px;}
.kb-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;display:flex;align-items:flex-start;gap:12px;transition:border-color .15s;}
.kb-card:hover{border-color:var(--border2);}
.cat-pill{padding:3px 9px;border-radius:20px;font-size:10px;font-family:'JetBrains Mono',monospace;flex-shrink:0;margin-top:1px;white-space:nowrap;}
.cat-job{background:var(--teal-dim);color:var(--teal);border:1px solid rgba(45,212,191,.25);}
.cat-hobby{background:var(--acc-dim);color:var(--acc);border:1px solid var(--acc-glow);}
.cat-memory{background:var(--pink-dim);color:var(--pink);border:1px solid rgba(244,114,182,.3);}
.cat-personality{background:rgba(251,191,36,.1);color:var(--amber);border:1px solid rgba(251,191,36,.25);}
.cat-other{background:var(--s3);color:var(--t2);border:1px solid var(--border2);}
.kb-info{flex:1;min-width:0;}
.kb-title{font-size:13px;font-weight:600;margin-bottom:4px;}
.kb-content{font-size:12px;color:var(--t2);line-height:1.55;}
.kb-actions{display:flex;gap:6px;flex-shrink:0;}
.icon-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--t3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s;}
.icon-btn:hover{border-color:var(--acc);color:var(--acc);}
.icon-btn.del:hover{border-color:var(--pink);color:var(--pink);}
.sch-list{display:flex;flex-direction:column;gap:8px;}
.sch-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;display:flex;gap:14px;align-items:center;transition:border-color .15s;flex-wrap:wrap;}
.sch-card:hover{border-color:var(--border2);}
.sch-card.sent{opacity:.45;}
.sch-timebox{background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:10px 14px;text-align:center;flex-shrink:0;}
.sch-date-txt{font-size:10px;color:var(--t3);font-family:'JetBrains Mono',monospace;}
.sch-time-txt{font-size:15px;font-weight:700;color:var(--teal);font-family:'JetBrains Mono',monospace;}
.sch-info{flex:1;min-width:120px;}
.sch-msg-txt{font-size:13px;margin-bottom:4px;}
.sch-ctx-txt{font-size:11px;color:var(--t3);font-style:italic;}
.status-pill{padding:3px 9px;border-radius:20px;font-size:10px;font-family:'JetBrains Mono',monospace;flex-shrink:0;}
.pill-pending{background:var(--teal-dim);color:var(--teal);border:1px solid rgba(45,212,191,.25);}
.pill-sent{background:var(--s3);color:var(--t3);border:1px solid var(--border);}
.cfg-list{display:flex;flex-direction:column;gap:8px;}
.cfg-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.cfg-key{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--acc);min-width:180px;flex-shrink:0;}
.cfg-vw{flex:1;min-width:100px;}
.cfg-val{font-size:13px;color:var(--t1);margin-bottom:2px;}
.cfg-desc{font-size:11px;color:var(--t3);}
.toggle{width:42px;height:23px;background:var(--border2);border-radius:12px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.toggle.on{background:var(--acc);}
.toggle::after{content:'';position:absolute;width:17px;height:17px;border-radius:50%;background:#fff;top:3px;left:3px;transition:transform .2s;}
.toggle.on::after{transform:translateX(19px);}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:300;display:none;align-items:flex-end;justify-content:center;}
.modal-overlay.open{display:flex;}
@media(min-width:600px){.modal-overlay{align-items:center;padding:20px;}}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:20px 20px 0 0;padding:28px 24px;width:100%;max-height:90vh;overflow-y:auto;}
@media(min-width:600px){.modal{border-radius:16px;max-width:480px;}}
.modal-title{font-size:15px;font-weight:700;margin-bottom:20px;color:var(--acc);font-family:'JetBrains Mono',monospace;}
.modal-handle{width:40px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 20px;}
@media(min-width:600px){.modal-handle{display:none;}}
.form-group{margin-bottom:14px;}
.form-lbl{display:block;font-size:11px;color:var(--t3);font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;}
.form-ctrl{width:100%;padding:10px 13px;background:var(--bg);border:1px solid var(--border2);border-radius:9px;color:var(--t1);font-size:13px;font-family:'Noto Sans Myanmar','Syne',sans-serif;outline:none;transition:border-color .2s;}
.form-ctrl:focus{border-color:var(--acc);}
textarea.form-ctrl{resize:vertical;min-height:80px;}
select.form-ctrl option{background:var(--s1);}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:10px;color:var(--t4);}
.empty-icon{font-size:36px;opacity:.4;}.empty-txt{font-size:13px;}
.loading{display:flex;align-items:center;justify-content:center;padding:48px;gap:10px;color:var(--t3);font-size:13px;}
.spin{width:18px;height:18px;border:2px solid var(--border2);border-top-color:var(--acc);border-radius:50%;animation:spin .6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);padding:10px 18px;border-radius:9px;font-size:13px;z-index:400;background:var(--s2);border:1px solid var(--border2);transition:all .25s;pointer-events:none;white-space:nowrap;opacity:0;}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1;}
@media(min-width:600px){.toast{left:auto;right:24px;transform:translateY(80px);}.toast.show{transform:translateY(0);}}
.toast.ok{border-color:rgba(45,212,191,.4);color:var(--teal);}
.toast.err{border-color:rgba(244,114,182,.4);color:var(--pink);}
@media(max-width:768px){
  :root{--sidebar:260px;}
  .sidebar{position:fixed;top:0;left:0;bottom:0;z-index:100;transform:translateX(-100%);}
  .sidebar.open{transform:translateX(0);}
  .hamburger{display:flex;}
  .overlay.open{display:block;}
  .pg-hdr{padding-top:56px;}
}
</style>
</head>
<body>
<div id="login-screen">
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-icon">🤖</div>
      <div class="login-name">WMT Junior</div>
      <div class="login-sub">Admin Panel</div>
      <input type="password" id="tok" class="inp" placeholder="Admin token ထည့်ပါ" onkeydown="if(event.key==='Enter')doLogin()">
      <button class="btn" onclick="doLogin()">ဝင်မည်</button>
      <div class="login-err" id="login-err">Token မမှန်ကန်ပါ</div>
    </div>
  </div>
</div>
<div class="hamburger" id="hamburger" onclick="toggleSB()">☰</div>
<div class="overlay" id="overlay" onclick="toggleSB()"></div>
<div class="app">
  <div class="sidebar" id="sidebar">
    <div class="sb-hdr">
      <div class="sb-logo">🤖</div>
      <div class="sb-brand">WMT Junior</div>
      <div class="sb-badge">Admin</div>
    </div>
    <div class="sb-live"><div class="dot"></div><div class="sb-live-txt">Live</div></div>
    <div class="sb-sec">Monitor</div>
    <div class="nav-item active" onclick="go('chats',this)"><span class="nav-icon">💬</span>Chat Logs</div>
    <div class="sb-sec">Manage</div>
    <div class="nav-item" onclick="go('kb',this)"><span class="nav-icon">📚</span>Knowledge Base</div>
    <div class="nav-item" onclick="go('schedule',this)"><span class="nav-icon">⏰</span>Schedules</div>
    <div class="sb-sec">System</div>
    <div class="nav-item" onclick="go('config',this)"><span class="nav-icon">⚙️</span>Config</div>
    <div class="sb-foot"><button class="logout-btn" onclick="doLogout()">Logout</button></div>
  </div>
  <div class="main">
    <div class="tab active" id="tab-chats">
      <div class="pg-hdr">
        <div class="pg-title">💬 Chat Logs</div>
        <div class="pg-meta" id="chat-meta">—</div>
        <button class="btn-out" onclick="loadChats()">↻ Refresh</button>
      </div>
      <div class="toolbar"><input type="text" class="search" id="chat-q" placeholder="Search messages..." oninput="filterChats()"></div>
      <div class="scroll-body" id="chat-body"><div class="loading"><div class="spin"></div>Loading...</div></div>
    </div>
    <div class="tab" id="tab-kb">
      <div class="pg-hdr">
        <div class="pg-title">📚 Knowledge Base</div>
        <div class="pg-meta" id="kb-meta">—</div>
        <button class="btn-pri" onclick="openKBModal()">+ Add</button>
      </div>
      <div class="toolbar">
        <select class="search" id="kb-cf" onchange="filterKB()" style="max-width:170px">
          <option value="">All Categories</option>
          <option value="job">Job</option><option value="hobby">Hobby</option>
          <option value="memory">Memory</option><option value="personality">Personality</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="scroll-body" id="kb-body"><div class="loading"><div class="spin"></div>Loading...</div></div>
    </div>
    <div class="tab" id="tab-schedule">
      <div class="pg-hdr">
        <div class="pg-title">⏰ Schedules</div>
        <div class="pg-meta" id="sch-meta">—</div>
        <button class="btn-out" onclick="loadSchedules()">↻ Refresh</button>
        <button class="btn-pri" onclick="openSchModal()">+ Add</button>
      </div>
      <div class="scroll-body" id="sch-body"><div class="loading"><div class="spin"></div>Loading...</div></div>
    </div>
    <div class="tab" id="tab-config">
      <div class="pg-hdr"><div class="pg-title">⚙️ Config</div></div>
      <div class="scroll-body" id="cfg-body" style="padding-top:16px"><div class="loading"><div class="spin"></div>Loading...</div></div>
    </div>
  </div>
</div>
<div class="modal-overlay" id="kb-modal" onclick="closeIfBg(event,'kb-modal')">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title" id="kb-modal-ttl">Add KB Entry</div>
    <input type="hidden" id="kb-edit-id">
    <div class="form-group"><label class="form-lbl">Category</label>
      <select class="form-ctrl" id="kb-cat">
        <option value="job">Job / ကုမ္ပဏီ</option><option value="hobby">Hobby / ဝါသနာ</option>
        <option value="memory">Memory</option><option value="personality">Personality</option><option value="other">Other</option>
      </select></div>
    <div class="form-group"><label class="form-lbl">Title</label><input type="text" class="form-ctrl" id="kb-title" placeholder="e.g. ကုမ္ပဏီ အမည်"></div>
    <div class="form-group"><label class="form-lbl">Content</label><textarea class="form-ctrl" id="kb-content" placeholder="Detail ထည့်ပါ..."></textarea></div>
    <div class="modal-actions">
      <button class="btn-out" onclick="closeModal('kb-modal')">Cancel</button>
      <button class="btn-pri" onclick="saveKB()">Save</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="sch-modal" onclick="closeIfBg(event,'sch-modal')">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">Add Scheduled Message</div>
    <div class="form-group"><label class="form-lbl">Send At</label><input type="datetime-local" class="form-ctrl" id="sch-time"></div>
    <div class="form-group"><label class="form-lbl">Message</label><textarea class="form-ctrl" id="sch-msg" placeholder="Bot က မမကို ဘာပြောမည်..."></textarea></div>
    <div class="form-group"><label class="form-lbl">Context (Admin မှတ်ချက်)</label><textarea class="form-ctrl" id="sch-ctx" placeholder="မှတ်ချက်..." style="min-height:60px"></textarea></div>
    <div class="modal-actions">
      <button class="btn-out" onclick="closeModal('sch-modal')">Cancel</button>
      <button class="btn-pri" onclick="saveSchedule()">Schedule</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
const W=window.location.origin;
let TOKEN='',chats=[],kbs=[],schs=[];
function doLogin(){const v=document.getElementById('tok').value.trim();if(!v)return;TOKEN=v;localStorage.setItem('wmtk',v);initApp();}
function doLogout(){localStorage.removeItem('wmtk');TOKEN='';location.reload();}
async function initApp(){
  const r=await api('/api/chats');
  if(!r.ok){document.getElementById('login-err').style.display='block';TOKEN='';return;}
  document.getElementById('login-screen').style.display='none';
  chats=await r.json();renderChats(chats);loadKB();loadSchedules();loadConfig();
}
async function api(path,opts={}){return fetch(W+path,{...opts,headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN,...(opts.headers||{})}});}
function go(name,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');el.classList.add('active');
  if(window.innerWidth<=768)toggleSB();
}
function toggleSB(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('open');}
async function loadChats(){
  document.getElementById('chat-body').innerHTML='<div class="loading"><div class="spin"></div>Loading...</div>';
  const r=await api('/api/chats');if(!r.ok)return;chats=await r.json();renderChats(chats);
}
function renderChats(logs){
  const el=document.getElementById('chat-body');
  document.getElementById('chat-meta').textContent=logs.length+' messages';
  if(!logs.length){el.innerHTML='<div class="empty"><div class="empty-icon">💬</div><div class="empty-txt">No messages yet</div></div>';return;}
  const grouped={};
  [...logs].reverse().forEach(m=>{
    const d=new Date(m.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
    if(!grouped[d])grouped[d]=[];grouped[d].push(m);
  });
  let h='<div class="chat-list">';
  for(const[date,msgs]of Object.entries(grouped)){
    h+=\`<div class="date-lbl">\${date}</div>\`;
    msgs.forEach(m=>{
      const isU=m.role==='user';
      const t=new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
      h+=\`<div class="msg-row \${isU?'user':'bot'}"><div class="msg-av \${isU?'usr-av':'bot-av'}">\${isU?'👩':'🤖'}</div><div><div class="msg-bubble">\${esc(m.message)}</div><div class="msg-time">\${t}</div></div></div>\`;
    });
  }
  h+='</div>';el.innerHTML=h;el.scrollTop=el.scrollHeight;
}
function filterChats(){const q=document.getElementById('chat-q').value.toLowerCase();renderChats(q?chats.filter(c=>c.message.toLowerCase().includes(q)):chats);}
async function loadKB(){const r=await api('/api/kb');if(!r.ok)return;kbs=await r.json();renderKB(kbs);}
const catC={job:'cat-job',hobby:'cat-hobby',memory:'cat-memory',personality:'cat-personality',other:'cat-other'};
const catL={job:'Job',hobby:'Hobby',memory:'Memory',personality:'Personality',other:'Other'};
function renderKB(items){
  const el=document.getElementById('kb-body');
  document.getElementById('kb-meta').textContent=items.length+' entries';
  if(!items.length){el.innerHTML='<div class="empty"><div class="empty-icon">📚</div><div class="empty-txt">No entries yet</div></div>';return;}
  el.innerHTML='<div class="kb-grid">'+items.map(k=>\`<div class="kb-card"><div class="cat-pill \${catC[k.category]||'cat-other'}">\${catL[k.category]||k.category}</div><div class="kb-info"><div class="kb-title">\${esc(k.title)}</div><div class="kb-content">\${esc(k.content)}</div></div><div class="kb-actions"><button class="icon-btn" onclick="editKB('\${k.id}')">✏️</button><button class="icon-btn del" onclick="delKB('\${k.id}')">🗑</button></div></div>\`).join('')+'</div>';
}
function filterKB(){const c=document.getElementById('kb-cf').value;renderKB(c?kbs.filter(k=>k.category===c):kbs);}
function openKBModal(){document.getElementById('kb-edit-id').value='';document.getElementById('kb-modal-ttl').textContent='Add KB Entry';document.getElementById('kb-cat').value='job';document.getElementById('kb-title').value='';document.getElementById('kb-content').value='';document.getElementById('kb-modal').classList.add('open');}
function editKB(id){const k=kbs.find(x=>x.id===id);if(!k)return;document.getElementById('kb-edit-id').value=id;document.getElementById('kb-modal-ttl').textContent='Edit KB Entry';document.getElementById('kb-cat').value=k.category;document.getElementById('kb-title').value=k.title;document.getElementById('kb-content').value=k.content;document.getElementById('kb-modal').classList.add('open');}
async function saveKB(){
  const id=document.getElementById('kb-edit-id').value;
  const body={category:document.getElementById('kb-cat').value,title:document.getElementById('kb-title').value.trim(),content:document.getElementById('kb-content').value.trim()};
  if(!body.title||!body.content)return toast('Title နဲ့ Content ထည့်ပါ','err');
  const r=await api(id?\`/api/kb/\${id}\`:'/api/kb',{method:id?'PATCH':'POST',body:JSON.stringify(body)});
  if(!r.ok)return toast('Error: '+await r.text(),'err');
  closeModal('kb-modal');toast('Saved','ok');loadKB();
}
async function delKB(id){if(!confirm('Delete?'))return;const r=await api(\`/api/kb/\${id}\`,{method:'DELETE'});if(!r.ok)return toast('Error','err');toast('Deleted','ok');loadKB();}
async function loadSchedules(){const r=await api('/api/schedules');if(!r.ok)return;schs=await r.json();renderSchedules(schs);}
function renderSchedules(items){
  const el=document.getElementById('sch-body');
  document.getElementById('sch-meta').textContent=items.filter(s=>!s.is_sent).length+' pending';
  if(!items.length){el.innerHTML='<div class="empty"><div class="empty-icon">⏰</div><div class="empty-txt">No schedules yet</div></div>';return;}
  el.innerHTML='<div class="sch-list">'+items.map(s=>{
    const d=new Date(s.send_at);
    return\`<div class="sch-card \${s.is_sent?'sent':''}"><div class="sch-timebox"><div class="sch-date-txt">\${d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</div><div class="sch-time-txt">\${d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div></div><div class="sch-info"><div class="sch-msg-txt">\${esc(s.message)}</div>\${s.context?\`<div class="sch-ctx-txt">📝 \${esc(s.context)}</div>\`:''}</div><div class="status-pill \${s.is_sent?'pill-sent':'pill-pending'}">\${s.is_sent?'Sent':'Pending'}</div>\${!s.is_sent?\`<button class="icon-btn del" onclick="delSch('\${s.id}')">✕</button>\`:''}</div>\`;
  }).join('')+'</div>';
}
function openSchModal(){const d=new Date(Date.now()+3600000);const p=n=>String(n).padStart(2,'0');document.getElementById('sch-time').value=\`\${d.getFullYear()}-\${p(d.getMonth()+1)}-\${p(d.getDate())}T\${p(d.getHours())}:\${p(d.getMinutes())}\`;document.getElementById('sch-msg').value='';document.getElementById('sch-ctx').value='';document.getElementById('sch-modal').classList.add('open');}
async function saveSchedule(){
  const t=document.getElementById('sch-time').value,m=document.getElementById('sch-msg').value.trim(),c=document.getElementById('sch-ctx').value.trim();
  if(!t||!m)return toast('Time နဲ့ Message ထည့်ပါ','err');
  const r=await api('/api/schedules',{method:'POST',body:JSON.stringify({message:m,context:c,send_at:new Date(t).toISOString()})});
  if(!r.ok)return toast('Error: '+await r.text(),'err');
  closeModal('sch-modal');toast('Scheduled','ok');loadSchedules();
}
async function delSch(id){if(!confirm('Cancel?'))return;const r=await api(\`/api/schedules/\${id}\`,{method:'DELETE'});if(!r.ok)return toast('Error','err');toast('Cancelled','ok');loadSchedules();}
async function loadConfig(){
  const r=await api('/api/config');if(!r.ok)return;const cfg=await r.json();
  const el=document.getElementById('cfg-body');
  if(!cfg.length){el.innerHTML='<div class="empty"><div class="empty-icon">⚙️</div><div class="empty-txt">No config</div></div>';return;}
  el.innerHTML='<div class="cfg-list">'+cfg.map(c=>\`<div class="cfg-card"><div class="cfg-key">\${esc(c.key)}</div><div class="cfg-vw"><div class="cfg-val">\${esc(c.value)}</div>\${c.description?\`<div class="cfg-desc">\${esc(c.description)}</div>\`:''}</div>\${c.key==='greeting_enabled'?\`<div class="toggle \${c.value==='true'?'on':''}" onclick="toggleCfg('\${c.key}',this)"></div>\`:\`<button class="btn-out" onclick="editCfg('\${c.key}','\${esc(c.value)}')">Edit</button>\`}</div>\`).join('')+'</div>';
}
async function toggleCfg(k,el){const on=el.classList.contains('on');el.classList.toggle('on');const r=await api('/api/config',{method:'PATCH',body:JSON.stringify({key:k,value:on?'false':'true'})});if(!r.ok){el.classList.toggle('on');toast('Error','err');}else toast('Updated','ok');}
async function editCfg(k,v){const n=prompt(\`\${k}:\`,v);if(n===null)return;const r=await api('/api/config',{method:'PATCH',body:JSON.stringify({key:k,value:n})});if(!r.ok)return toast('Error','err');toast('Updated','ok');loadConfig();}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function closeIfBg(e,id){if(e.target===document.getElementById(id))closeModal(id);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
let _tt;
function toast(msg,type='ok'){const t=document.getElementById('toast');t.textContent=msg;t.className=\`toast \${type} show\`;clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2500);}
const saved=localStorage.getItem('wmtk');if(saved){TOKEN=saved;initApp();}
</script>
</body>
</html>
`;
export default ADMIN_HTML;
