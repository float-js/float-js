/**
 * Float.js Dev Indicator
 * Minimalist indicator inspired by Next.js
 */

export const FLOAT_INDICATOR_SCRIPT = `
<script id="__float-indicator">
(function() {
  var isConnected = false;
  var isOpen = false;
  var buildTime = null;
  var startTime = Date.now();
  
  var indicator = document.createElement('div');
  indicator.id = '__float-dev-indicator';
  indicator.innerHTML = '<div class="float-btn" id="float-btn"><svg width="16" height="16" viewBox="0 0 200 200" fill="none"><path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="#3B82F6"/><path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="#6366F1"/><path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="#8B5CF6"/></svg><span class="float-dot" id="float-dot"></span></div><div class="float-panel" id="float-panel"><div class="float-panel-header"><svg width="20" height="20" viewBox="0 0 200 200" fill="none"><path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="#3B82F6"/><path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="#6366F1"/><path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="#8B5CF6"/></svg><span>Float.js</span><span class="float-version">v2.0.1</span></div><div class="float-panel-body"><div class="float-row"><span class="float-label">Estado</span><span class="float-value" id="float-state">Conectando...</span></div><div class="float-row"><span class="float-label">HMR</span><span class="float-value" id="float-hmr">—</span></div><div class="float-row"><span class="float-label">Build</span><span class="float-value" id="float-build">—</span></div></div><div class="float-panel-footer"><a href="/__float" class="float-link">Dashboard</a><a href="https://floatjs.dev/docs" target="_blank" class="float-link">Docs</a></div></div>';
  
  var styles = document.createElement('style');
  styles.textContent = '#__float-dev-indicator{position:fixed;bottom:16px;left:16px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px}.float-btn{display:flex;align-items:center;gap:6px;padding:8px 10px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,0.05);cursor:pointer;transition:all 0.15s}.float-btn:hover{border-color:#d1d5db;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.float-dot{width:8px;height:8px;border-radius:50%;background:#d1d5db;transition:background 0.2s}.float-dot.connected{background:#22c55e}.float-dot.error{background:#ef4444}.float-dot.building{background:#eab308;animation:blink 0.8s infinite}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}.float-panel{position:absolute;bottom:48px;left:0;width:240px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.1);opacity:0;visibility:hidden;transform:translateY(8px);transition:all 0.2s ease}.float-panel.open{opacity:1;visibility:visible;transform:translateY(0)}.float-panel-header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827}.float-version{margin-left:auto;font-size:11px;font-weight:400;color:#9ca3af}.float-panel-body{padding:8px 0}.float-row{display:flex;justify-content:space-between;padding:8px 14px}.float-label{color:#6b7280}.float-value{color:#111827;font-weight:500}.float-value.success{color:#16a34a}.float-value.error{color:#dc2626}.float-panel-footer{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #f3f4f6}.float-link{flex:1;text-align:center;padding:8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;color:#374151;text-decoration:none;font-size:12px;font-weight:500;transition:all 0.15s}.float-link:hover{background:#f3f4f6;border-color:#d1d5db}';
  
  document.head.appendChild(styles);
  document.body.appendChild(indicator);
  
  var btn = document.getElementById('float-btn');
  var panel = document.getElementById('float-panel');
  var dot = document.getElementById('float-dot');
  var stateEl = document.getElementById('float-state');
  var hmrEl = document.getElementById('float-hmr');
  var buildEl = document.getElementById('float-build');
  
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
  });
  
  document.addEventListener('click', function(e) {
    if (!indicator.contains(e.target) && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });
  
  function updateStatus(state) {
    dot.className = 'float-dot ' + state;
    if (state === 'connected') {
      stateEl.textContent = 'Conectado';
      stateEl.className = 'float-value success';
      hmrEl.textContent = 'Activo';
      hmrEl.className = 'float-value success';
    } else if (state === 'building') {
      stateEl.textContent = 'Compilando...';
      stateEl.className = 'float-value';
    } else if (state === 'error') {
      stateEl.textContent = 'Error';
      stateEl.className = 'float-value error';
    } else {
      stateEl.textContent = 'Desconectado';
      stateEl.className = 'float-value';
      hmrEl.textContent = 'Inactivo';
      hmrEl.className = 'float-value';
    }
  }
  
  var wsUrl = 'ws://' + window.location.hostname + ':' + (parseInt(window.location.port) + 1);
  var ws;
  var reconnectAttempts = 0;
  
  function connect() {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = function() {
      isConnected = true;
      reconnectAttempts = 0;
      buildTime = new Date();
      updateStatus('connected');
      buildEl.textContent = 'Ahora';
    };
    
    ws.onmessage = function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'reload') window.location.reload();
        if (data.type === 'building') updateStatus('building');
        if (data.type === 'update' || data.type === 'clear-errors') {
          buildTime = new Date();
          buildEl.textContent = 'Ahora';
          updateStatus('connected');
        }
        if (data.type === 'error') updateStatus('error');
      } catch (e) {}
    };
    
    ws.onclose = function() {
      isConnected = false;
      updateStatus('');
      var delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      reconnectAttempts++;
      setTimeout(connect, delay);
    };
    
    ws.onerror = function() { ws.close(); };
  }
  
  connect();
  
  setInterval(function() {
    if (buildTime && isConnected) {
      var sec = Math.floor((Date.now() - buildTime) / 1000);
      if (sec < 5) buildEl.textContent = 'Ahora';
      else if (sec < 60) buildEl.textContent = sec + 's';
      else buildEl.textContent = Math.floor(sec / 60) + 'm';
    }
  }, 1000);
})();
<\/script>
`;
