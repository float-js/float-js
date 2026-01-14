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
  const uptimeMinutes = Math.round(metrics.uptime / 60000);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Float.js Dev Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-primary: #0a0a0a;
      --bg-secondary: #111111;
      --bg-tertiary: #1a1a1a;
      --text-primary: #ffffff;
      --text-secondary: #a1a1aa;
      --accent: #8b5cf6;
      --accent-hover: #a78bfa;
      --success: #22c55e;
      --warning: #eab308;
      --error: #ef4444;
      --border: #27272a;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--accent), #ec4899);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .badge {
      background: var(--accent);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: transform 0.2s, border-color 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }

    .metric-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .metric-unit {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-left: 0.25rem;
    }

    .section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .section-header {
      padding: 1rem 1.5rem;
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

    .section-content {
      padding: 1rem;
    }

    .routes-grid {
      display: grid;
      gap: 0.5rem;
    }

    .route-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--bg-tertiary);
      border-radius: 8px;
      transition: background 0.2s;
    }

    .route-item:hover {
      background: var(--bg-primary);
    }

    .route-type {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .route-type.page { background: #3b82f620; color: #60a5fa; }
    .route-type.api { background: #22c55e20; color: #4ade80; }
    .route-type.layout { background: #a855f720; color: #c084fc; }
    .route-type.error { background: #ef444420; color: #f87171; }

    .route-path {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
      flex: 1;
    }

    .route-file {
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .request-log {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }

    .request-log:last-child {
      border-bottom: none;
    }

    .method {
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      min-width: 50px;
      text-align: center;
    }

    .method.GET { background: #3b82f620; color: #60a5fa; }
    .method.POST { background: #22c55e20; color: #4ade80; }
    .method.PUT { background: #eab30820; color: #facc15; }
    .method.DELETE { background: #ef444420; color: #f87171; }
    .method.PATCH { background: #f9731620; color: #fb923c; }

    .status {
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .status.success { background: #22c55e20; color: #4ade80; }
    .status.redirect { background: #3b82f620; color: #60a5fa; }
    .status.client-error { background: #eab30820; color: #facc15; }
    .status.server-error { background: #ef444420; color: #f87171; }

    .request-path {
      font-family: 'Monaco', 'Menlo', monospace;
      flex: 1;
    }

    .request-duration {
      color: var(--text-secondary);
    }

    .request-time {
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .refresh-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .refresh-btn:hover {
      background: var(--accent-hover);
    }

    .tab-nav {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .tab-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .tab-btn:hover, .tab-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--success);
      font-size: 0.875rem;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .builds-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .build-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
    }

    .build-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .build-status.success { background: var(--success); }
    .build-status.error { background: var(--error); }

    .build-duration {
      font-weight: 600;
      color: var(--accent);
    }

    .build-time {
      color: var(--text-secondary);
      font-size: 0.75rem;
      margin-left: auto;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-primary); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--accent); }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">
      <div class="logo-icon">F</div>
      <span>Float.js</span>
      <span class="badge">Dev Dashboard</span>
    </div>
    <div class="live-indicator">
      <span class="live-dot"></span>
      <span>Development Mode</span>
    </div>
  </header>

  <div class="container">
    <!-- Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Requests</div>
        <div class="metric-value">${metrics.requests}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Response Time</div>
        <div class="metric-value">${metrics.avgResponseTime}<span class="metric-unit">ms</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Error Rate</div>
        <div class="metric-value">${metrics.errorRate}<span class="metric-unit">%</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Memory Usage</div>
        <div class="metric-value">${memoryMB}<span class="metric-unit">MB</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Uptime</div>
        <div class="metric-value">${uptimeMinutes}<span class="metric-unit">min</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Routes</div>
        <div class="metric-value">${state.routes.length}</div>
      </div>
    </div>

    <!-- Routes -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          📁 Routes
        </div>
        <span style="color: var(--text-secondary); font-size: 0.875rem;">
          ${state.routes.length} registered
        </span>
      </div>
      <div class="section-content">
        ${state.routes.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No routes registered yet</p>
          </div>
        ` : `
          <div class="routes-grid">
            ${state.routes.map(route => `
              <div class="route-item">
                <span class="route-type ${route.type}">${route.type}</span>
                <span class="route-path">${route.path}</span>
                ${route.methods ? `<span style="color: var(--text-secondary); font-size: 0.75rem;">${route.methods.join(', ')}</span>` : ''}
                <span class="route-file">${route.file}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>

    <!-- Request Logs -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          📊 Request Logs
        </div>
        <button class="refresh-btn" onclick="location.reload()">
          Refresh
        </button>
      </div>
      <div class="section-content" style="padding: 0;">
        ${state.requestLogs.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No requests logged yet</p>
          </div>
        ` : state.requestLogs.slice(0, 50).map(log => {
          const statusClass = log.status < 300 ? 'success' 
            : log.status < 400 ? 'redirect'
            : log.status < 500 ? 'client-error' 
            : 'server-error';
          return `
            <div class="request-log">
              <span class="method ${log.method}">${log.method}</span>
              <span class="status ${statusClass}">${log.status}</span>
              <span class="request-path">${log.path}</span>
              <span class="request-duration">${log.duration}ms</span>
              <span class="request-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Build History -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          🔨 Build History
        </div>
      </div>
      <div class="section-content builds-list" style="padding: 0;">
        ${state.builds.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🔨</div>
            <p>No builds recorded yet</p>
          </div>
        ` : state.builds.map(build => `
          <div class="build-item">
            <span class="build-status ${build.success ? 'success' : 'error'}"></span>
            <span class="build-duration">${build.duration}ms</span>
            <span>${build.success ? 'Build successful' : 'Build failed'}</span>
            <span class="build-time">${new Date(build.timestamp).toLocaleTimeString()}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <script>
    // Auto-refresh every 5 seconds
    setTimeout(() => location.reload(), 5000);
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
