/**
 * Float.js Dev Dashboard
 * Visual development tools integrated into the framework
 * 
 * Next.js doesn't have this! 🚀
 */

import { IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// TYPES
// ============================================================================

export interface RouteInfo {
  path: string;
  type: 'page' | 'api' | 'layout' | 'error' | 'loading' | 'not-found';
  file: string;
  methods?: string[];
  params?: string[];
  middleware?: boolean;
}

export interface BuildInfo {
  duration: number;
  timestamp: Date;
  success: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  timestamp: Date;
  headers?: Record<string, string>;
  body?: unknown;
  response?: unknown;
}

export interface PerformanceMetrics {
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

export interface DevDashboardOptions {
  enabled?: boolean;
  path?: string;
  maxLogs?: number;
  auth?: {
    username: string;
    password: string;
  };
}

// ============================================================================
// DEV DASHBOARD STATE
// ============================================================================

class DevDashboardState {
  routes: RouteInfo[] = [];
  builds: BuildInfo[] = [];
  requestLogs: RequestLog[] = [];
  startTime: Date = new Date();
  maxLogs: number = 100;
  
  private requestCount = 0;
  private totalResponseTime = 0;
  private errorCount = 0;

  addRoute(route: RouteInfo): void {
    const existing = this.routes.findIndex(r => r.path === route.path);
    if (existing >= 0) {
      this.routes[existing] = route;
    } else {
      this.routes.push(route);
    }
  }

  addBuild(build: BuildInfo): void {
    this.builds.unshift(build);
    if (this.builds.length > 20) {
      this.builds.pop();
    }
  }

  logRequest(log: RequestLog): void {
    this.requestLogs.unshift(log);
    if (this.requestLogs.length > this.maxLogs) {
      this.requestLogs.pop();
    }
    
    this.requestCount++;
    this.totalResponseTime += log.duration;
    if (log.status >= 400) {
      this.errorCount++;
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      requests: this.requestCount,
      avgResponseTime: this.requestCount > 0 
        ? Math.round(this.totalResponseTime / this.requestCount) 
        : 0,
      errorRate: this.requestCount > 0 
        ? Math.round((this.errorCount / this.requestCount) * 100) 
        : 0,
      activeConnections: 0, // Updated by server
      memoryUsage: process.memoryUsage(),
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  clear(): void {
    this.requestLogs = [];
    this.requestCount = 0;
    this.totalResponseTime = 0;
    this.errorCount = 0;
  }
}

export const dashboardState = new DevDashboardState();

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function createRequestLogger() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const startTime = Date.now();
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Capture response
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, callback?: any) {
      const duration = Date.now() - startTime;
      
      dashboardState.logRequest({
        id,
        method: req.method || 'GET',
        path: req.url || '/',
        status: res.statusCode,
        duration,
        timestamp: new Date(),
      });

      return originalEnd(chunk, encoding, callback);
    } as typeof res.end;

    next();
  };
}

// ============================================================================
// DASHBOARD HTML
// ============================================================================

function generateDashboardHTML(state: DevDashboardState): string {
  const metrics = state.getMetrics();
  const memoryMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotal = Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024);
  const uptimeSeconds = Math.round(metrics.uptime / 1000);
  const uptimeFormatted = uptimeSeconds < 60 
    ? `${uptimeSeconds}s` 
    : uptimeSeconds < 3600 
      ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
      : `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
  
  const lastBuild = state.builds.length > 0 ? state.builds[0] : null;
  const lastBuildTime = lastBuild 
    ? new Date(lastBuild.timestamp).toLocaleTimeString() 
    : 'Never';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Float.js Dev Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-dark: #09090b;
      --bg-card: #18181b;
      --bg-card-hover: #1f1f23;
      --bg-sidebar: #0f0f12;
      --text-primary: #fafafa;
      --text-secondary: #71717a;
      --text-muted: #52525b;
      --accent: #a855f7;
      --accent-glow: rgba(168, 85, 247, 0.15);
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
      --border: #27272a;
      --border-subtle: #1f1f23;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-weight: 700;
      font-size: 1.125rem;
      background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .logo-version {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    /* Status Cards */
    .status-section {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .status-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--bg-card);
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
    }

    .status-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-value {
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .status-value.connected {
      color: var(--success);
    }

    .status-value.active {
      color: var(--accent);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-dot.green { background: var(--success); box-shadow: 0 0 8px var(--success); }
    .status-dot.purple { background: var(--accent); box-shadow: 0 0 8px var(--accent); }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }

    /* Navigation */
    .nav-section {
      padding: 1rem;
      flex: 1;
    }

    .nav-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      margin-bottom: 0.25rem;
    }

    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--accent-glow);
      color: var(--accent);
      border: 1px solid rgba(168, 85, 247, 0.2);
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    .nav-badge {
      margin-left: auto;
      background: var(--bg-card);
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
    }

    .docs-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 10px;
      color: var(--accent);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .docs-link:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
      transform: translateY(-1px);
    }

    /* Main Content */
    .main {
      margin-left: 280px;
      flex: 1;
      padding: 2rem;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent), #ec4899);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .metric-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
    }

    .metric-card:hover::before {
      opacity: 1;
    }

    .metric-icon {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 0.25rem;
    }

    .metric-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-change {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-weight: 500;
    }

    .metric-change.up { background: rgba(34, 197, 94, 0.1); color: var(--success); }
    .metric-change.down { background: rgba(239, 68, 68, 0.1); color: var(--error); }

    /* Sections */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .section {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      overflow: hidden;
    }

    .section.full-width {
      grid-column: 1 / -1;
    }

    .section-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-badge {
      background: var(--bg-dark);
      padding: 0.25rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .section-content {
      max-height: 400px;
      overflow-y: auto;
    }

    /* Routes List */
    .route-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      transition: background 0.2s;
    }

    .route-item:last-child {
      border-bottom: none;
    }

    .route-item:hover {
      background: var(--bg-card-hover);
    }

    .route-type {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      min-width: 60px;
      text-align: center;
    }

    .route-type.page { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .route-type.api { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .route-type.layout { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .route-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      flex: 1;
    }

    .route-file {
      color: var(--text-muted);
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Request Logs */
    .log-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .log-item:hover {
      background: var(--bg-card-hover);
    }

    .log-method {
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      min-width: 50px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .log-method.GET { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .log-method.POST { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .log-method.PUT { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .log-method.DELETE { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .log-status {
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    .log-status.s2xx { color: var(--success); }
    .log-status.s3xx { color: #60a5fa; }
    .log-status.s4xx { color: var(--warning); }
    .log-status.s5xx { color: var(--error); }

    .log-path {
      font-family: 'JetBrains Mono', monospace;
      flex: 1;
      color: var(--text-secondary);
    }

    .log-duration {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .log-time {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* Responsive */
    @media (max-width: 1200px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">
          <span class="logo-title">Float.js</span>
          <span class="logo-version">v2.0.1</span>
        </div>
      </div>
    </div>

    <div class="status-section">
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">
            <span class="status-dot green"></span>
            Estado
          </span>
          <span class="status-value connected">Conectado</span>
        </div>
        <div class="status-item">
          <span class="status-label">
            <span class="status-dot purple"></span>
            HMR
          </span>
          <span class="status-value active">Activo</span>
        </div>
        <div class="status-item">
          <span class="status-label">Último build</span>
          <span class="status-value">${lastBuildTime}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Uptime</span>
          <span class="status-value">${uptimeFormatted}</span>
        </div>
      </div>
    </div>

    <nav class="nav-section">
      <div class="nav-label">Dashboard</div>
      <div class="nav-item active">
        <span class="nav-icon">📊</span>
        Overview
      </div>
      <div class="nav-item">
        <span class="nav-icon">🛤️</span>
        Routes
        <span class="nav-badge">${state.routes.length}</span>
      </div>
      <div class="nav-item">
        <span class="nav-icon">📝</span>
        Logs
        <span class="nav-badge">${state.requestLogs.length}</span>
      </div>
      <div class="nav-item">
        <span class="nav-icon">⚙️</span>
        Settings
      </div>
    </nav>

    <div class="sidebar-footer">
      <a href="https://floatjs.dev/docs" target="_blank" class="docs-link">
        <span>📚</span>
        Documentation
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="main">
    <div class="page-header">
      <h1 class="page-title">Dev Dashboard</h1>
      <p class="page-subtitle">Monitor your Float.js application in real-time</p>
    </div>

    <!-- Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">📡</div>
        <div class="metric-value">${metrics.requests}</div>
        <div class="metric-label">Total Requests</div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">⚡</div>
        <div class="metric-value">${metrics.avgResponseTime}ms</div>
        <div class="metric-label">Avg Response</div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">💾</div>
        <div class="metric-value">${memoryMB}/${memoryTotal}</div>
        <div class="metric-label">Memory (MB)</div>
      </div>
      <div class="metric-card">
        <div class="metric-icon">${metrics.errorRate > 0 ? '⚠️' : '✅'}</div>
        <div class="metric-value">${metrics.errorRate}%</div>
        <div class="metric-label">Error Rate</div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Routes -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">🛤️ Routes</span>
          <span class="section-badge">${state.routes.length} registered</span>
        </div>
        <div class="section-content">
          ${state.routes.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🛤️</div>
              <p>No routes registered</p>
            </div>
          ` : state.routes.map(route => `
            <div class="route-item">
              <span class="route-type ${route.type}">${route.type}</span>
              <span class="route-path">${route.path}</span>
              <span class="route-file">${route.file.split('/').pop()}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Request Logs -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">📝 Request Logs</span>
          <span class="section-badge">Live</span>
        </div>
        <div class="section-content">
          ${state.requestLogs.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <p>No requests yet</p>
            </div>
          ` : state.requestLogs.slice(0, 20).map(log => {
            const statusClass = log.status < 300 ? 's2xx' : log.status < 400 ? 's3xx' : log.status < 500 ? 's4xx' : 's5xx';
            return `
              <div class="log-item">
                <span class="log-method ${log.method}">${log.method}</span>
                <span class="log-status ${statusClass}">${log.status}</span>
                <span class="log-path">${log.path}</span>
                <span class="log-duration">${log.duration}ms</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  </main>

  <script>
    // Auto-refresh every 3 seconds
    setTimeout(() => location.reload(), 3000);
  </script>
</body>
</html>`;
}

// ============================================================================
// DASHBOARD API
// ============================================================================

function generateAPIResponse(state: DevDashboardState): string {
  return JSON.stringify({
    metrics: state.getMetrics(),
    routes: state.routes,
    builds: state.builds.slice(0, 10),
    requestLogs: state.requestLogs.slice(0, 50),
  });
}

// ============================================================================
// DASHBOARD HANDLER
// ============================================================================

export function createDevDashboard(options: DevDashboardOptions = {}) {
  const {
    enabled = process.env.NODE_ENV !== 'production',
    path = '/__float',
    auth,
  } = options;

  if (!enabled) {
    return (_req: IncomingMessage, _res: ServerResponse, next: () => void) => next();
  }

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';
    
    // Check if this is a dashboard request
    if (!url.startsWith(path)) {
      return next();
    }

    // Basic auth if configured
    if (auth) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Float.js Dev Dashboard"');
        res.statusCode = 401;
        res.end('Unauthorized');
        return;
      }

      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username, password] = credentials.split(':');
      
      if (username !== auth.username || password !== auth.password) {
        res.statusCode = 401;
        res.end('Invalid credentials');
        return;
      }
    }

    // Route dashboard requests
    const subPath = url.slice(path.length);

    if (subPath === '' || subPath === '/') {
      // Main dashboard
      res.setHeader('Content-Type', 'text/html');
      res.end(generateDashboardHTML(dashboardState));
      return;
    }

    if (subPath === '/api' || subPath === '/api/') {
      // API endpoint
      res.setHeader('Content-Type', 'application/json');
      res.end(generateAPIResponse(dashboardState));
      return;
    }

    if (subPath === '/api/routes') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(dashboardState.routes));
      return;
    }

    if (subPath === '/api/metrics') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(dashboardState.getMetrics()));
      return;
    }

    if (subPath === '/api/logs') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(dashboardState.requestLogs.slice(0, 100)));
      return;
    }

    if (subPath === '/api/clear' && req.method === 'POST') {
      dashboardState.clear();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 404 for unknown dashboard routes
    res.statusCode = 404;
    res.end('Not found');
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const devtools = {
  dashboard: createDevDashboard,
  logger: createRequestLogger,
  state: dashboardState,
  
  // Helpers for manual logging
  logRoute: (route: RouteInfo) => dashboardState.addRoute(route),
  logBuild: (build: BuildInfo) => dashboardState.addBuild(build),
  logRequest: (log: RequestLog) => dashboardState.logRequest(log),
  getMetrics: () => dashboardState.getMetrics(),
  clear: () => dashboardState.clear(),
};
