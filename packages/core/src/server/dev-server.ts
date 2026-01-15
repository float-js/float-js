/**
 * Float.js Development Server
 * Fast development experience with HMR
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import mime from 'mime-types';
import { scanRoutes, matchRoute, type Route } from '../router/index.js';
import { renderPage } from './ssr.js';
import { transformFile } from '../build/transform.js';
import { FLOAT_INDICATOR_SCRIPT } from '../client/float-indicator.js';
import { FLOAT_ERROR_OVERLAY } from '../client/error-overlay.js';
import { generateWelcomePage } from '../client/welcome-page.js';
import { generateDocsPage, generateLearnPage, generateExamplesPage } from '../client/docs-pages.js';
import { processCSS, needsCSSProcessing } from '../build/css-processor.js';
import { setupTailwind, checkTailwindSetup, getTailwindInstallCommand } from '../build/tailwind-setup.js';

export interface DevServerOptions {
  port: number;
  host: string;
  open?: boolean;
}

export interface DevServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
}

export async function createDevServer(options: DevServerOptions): Promise<DevServer> {
  const { port, host, open } = options;
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  
  let routes: Route[] = [];
  let server: http.Server | null = null;
  let wss: WebSocketServer | null = null;
  const clients = new Set<WebSocket>();

  // Scan routes on startup
  async function refreshRoutes() {
    try {
      routes = await scanRoutes(rootDir);
      console.log(pc.dim(`  📁 Found ${routes.length} routes`));
      
      // Auto-setup Tailwind if needed
      const tailwindConfig = checkTailwindSetup(rootDir);
      if (tailwindConfig.needsSetup) {
        console.log(pc.yellow('  ⚠️  Tailwind not configured'));
        const installCmd = getTailwindInstallCommand(rootDir);
        if (installCmd) {
          console.log(pc.dim(`  💡 Run: ${installCmd}`));
          console.log(pc.dim(`  💡 Then: npx float dev`));
        } else {
          // Setup files automatically
          await setupTailwind(rootDir);
        }
      }
    } catch (error) {
      console.error(pc.red('Failed to scan routes:'), error);
    }
  }

  // Notify all clients to reload
  function notifyClients(type: 'reload' | 'update' | 'error' | 'clear-errors' | 'building', data?: any) {
    const message = JSON.stringify({ type, data, error: data?.error, timestamp: Date.now() });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // HMR client script injected into HTML
  const hmrClientScript = `
<script>
(function() {
  const ws = new WebSocket('ws://${host}:${port + 1}');
  
  ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // Update Float indicator if available
    if (window.__FLOAT_UPDATE_STATUS) {
      window.__FLOAT_UPDATE_STATUS(data);
    }
    
    if (data.type === 'reload') {
      console.log('[Float HMR] Reloading...');
      window.location.reload();
    }
    if (data.type === 'update') {
      console.log('[Float HMR] Update received:', data.data);
    }
    if (data.type === 'error' && window.__FLOAT_SHOW_ERROR) {
      window.__FLOAT_SHOW_ERROR(data.error);
    }
    if (data.type === 'clear-errors' && window.__FLOAT_CLEAR_ERRORS) {
      window.__FLOAT_CLEAR_ERRORS();
    }
  };
  
  ws.onopen = function() {
    console.log('[Float HMR] Connected');
    if (window.__FLOAT_SET_CONNECTED) {
      window.__FLOAT_SET_CONNECTED(true);
    }
  };
  
  ws.onclose = function() {
    console.log('[Float HMR] Disconnected. Attempting reconnect...');
    if (window.__FLOAT_SET_CONNECTED) {
      window.__FLOAT_SET_CONNECTED(false);
    }
    setTimeout(() => window.location.reload(), 1000);
  };
})();
</script>
${FLOAT_INDICATOR_SCRIPT}
${FLOAT_ERROR_OVERLAY}
`;

  // Request handler
  async function handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const pathname = url.pathname;

    console.log(pc.dim(`  ${req.method} ${pathname}`));

    try {
      // Serve static files from public/
      const publicFilePath = path.join(publicDir, pathname);
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        const content = fs.readFileSync(publicFilePath);
        const contentType = mime.lookup(publicFilePath) || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }

      // Serve CSS files (with processing for Tailwind)
      if (pathname.endsWith('.css')) {
        const cssPath = path.join(rootDir, 'app', pathname.replace(/^\//, ''));
        if (fs.existsSync(cssPath)) {
          try {
            const needsProcessing = needsCSSProcessing(cssPath, rootDir);
            if (needsProcessing) {
              const result = await processCSS(cssPath, rootDir);
              res.writeHead(200, { 
                'Content-Type': 'text/css',
                'Cache-Control': 'no-cache',
              });
              res.end(result.code);
            } else {
              const content = fs.readFileSync(cssPath, 'utf-8');
              res.writeHead(200, { 
                'Content-Type': 'text/css',
                'Cache-Control': 'no-cache',
              });
              res.end(content);
            }
            return;
          } catch (error) {
            console.error(pc.red('CSS processing error:'), error);
            // Fallback to raw CSS
            const content = fs.readFileSync(cssPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(content);
            return;
          }
        }
      }

      // Serve /_float/ internal assets
      if (pathname.startsWith('/_float/')) {
        // Handle internal float assets
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end('// Float.js internal asset');
        return;
      }

      // Serve Dev Dashboard at /__float
      if (pathname === '/__float' || pathname.startsWith('/__float/')) {
        const { dashboardState } = await import('../devtools/index.js');
        
        // Sync current routes to dashboard
        dashboardState.routes = routes.map(r => ({
          path: r.path,
          type: r.type,
          file: r.filePath || r.absolutePath,
          hasLayout: r.layouts && r.layouts.length > 0
        }));
        
        // Use the dashboard handler via middleware pattern
        const { createDevDashboard } = await import('../devtools/index.js');
        const handler = createDevDashboard({ path: '/__float' });
        
        handler(req, res, () => {
          res.writeHead(404);
          res.end('Not Found');
        });
        return;
      }

      // Match route
      const { route, params } = matchRoute(pathname, routes);

      // Show welcome page if no routes configured and visiting root
      if (!route && pathname === '/' && routes.length === 0) {
        res.writeHead(200, { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        });
        res.end(generateWelcomePage());
        return;
      }

      // Internal Float.js pages (docs, learn, examples)
      if (pathname === '/__docs') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(generateDocsPage());
        return;
      }
      if (pathname === '/__learn') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(generateLearnPage());
        return;
      }
      if (pathname === '/__examples') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(generateExamplesPage());
        return;
      }

      if (!route) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(create404Page(pathname));
        return;
      }

      // Handle API routes
      if (route.type === 'api') {
        await handleApiRoute(req, res, route, params);
        return;
      }

      // Render page with SSR
      const html = await renderPage(route, params, { 
        hmrScript: hmrClientScript,
        isDev: true,
      });

      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(html);

    } catch (error) {
      console.error(pc.red('Request error:'), error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(createErrorPage(error as Error));
    }
  }

  // Handle API routes
  async function handleApiRoute(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    route: Route,
    params: Record<string, string>
  ) {
    try {
      const module = await transformFile(route.absolutePath);
      const method = req.method?.toUpperCase() || 'GET';
      
      // Create Request object
      const url = new URL(req.url || '/', `http://${host}:${port}`);
      const body = await getRequestBody(req);
      
      const request = new Request(url.toString(), {
        method,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([_, v]) => v !== undefined) as [string, string][]
        ),
        body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      });

      // Find handler
      const handler = module[method] || module.default;
      
      if (!handler) {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      // Execute handler
      const response: Response = await handler(request, { params });
      
      // Send response
      res.writeHead(response.status, Object.fromEntries(response.headers));
      const responseBody = await response.text();
      res.end(responseBody);

    } catch (error) {
      console.error(pc.red('API route error:'), error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  async function start() {
    await refreshRoutes();

    // Create HTTP server
    server = http.createServer(handleRequest);
    
    // Create WebSocket server for HMR
    wss = new WebSocketServer({ port: port + 1 });
    wss.on('connection', (ws) => {
      clients.add(ws);
      ws.on('close', () => clients.delete(ws));
    });

    // Watch for file changes
    const watcher = chokidar.watch(
      [
        path.join(rootDir, 'app/**/*.{ts,tsx,js,jsx}'),
        path.join(rootDir, 'components/**/*.{ts,tsx,js,jsx}'),
        path.join(rootDir, 'lib/**/*.{ts,tsx,js,jsx}'),
      ],
      {
        ignored: /node_modules/,
        persistent: true,
      }
    );

    watcher.on('change', async (filePath) => {
      console.log(pc.yellow(`\n  ⚡ File changed: ${path.relative(rootDir, filePath)}`));
      
      // Check if it's a route file
      if (filePath.includes('/app/')) {
        await refreshRoutes();
      }
      
      notifyClients('reload');
    });

    watcher.on('add', async (filePath) => {
      if (filePath.includes('/app/')) {
        console.log(pc.green(`\n  ➕ File added: ${path.relative(rootDir, filePath)}`));
        await refreshRoutes();
        notifyClients('reload');
      }
    });

    watcher.on('unlink', async (filePath) => {
      if (filePath.includes('/app/')) {
        console.log(pc.red(`\n  ➖ File removed: ${path.relative(rootDir, filePath)}`));
        await refreshRoutes();
        notifyClients('reload');
      }
    });

    // Start server
    return new Promise<void>((resolve, reject) => {
      server!.listen(port, host, () => {
        console.log(pc.green(`  ✅ Server running at ${pc.cyan(`http://${host}:${port}`)}`));
        console.log(pc.dim(`  ⚡ HMR enabled on ws://${host}:${port + 1}\n`));
        
        // Print routes
        console.log(pc.bold('  Routes:'));
        routes.forEach(route => {
          if (route.type === 'page') {
            console.log(pc.dim(`    ${pc.green('●')} ${route.path}`));
          } else if (route.type === 'api') {
            console.log(pc.dim(`    ${pc.blue('◆')} ${route.path} (API)`));
          }
        });
        console.log('');

        if (open) {
          import('child_process').then(({ exec }) => {
            exec(`open http://${host}:${port}`);
          });
        }

        resolve();
      });

      server!.on('error', reject);
    });
  }

  async function stop() {
    return new Promise<void>((resolve) => {
      wss?.close();
      server?.close(() => resolve());
    });
  }

  async function restart() {
    await stop();
    await start();
  }

  return { start, stop, restart };
}

// Helper functions
function getRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function create404Page(pathname: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Not Found | Float.js</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 8rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
         -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    h2 { font-size: 1.5rem; margin: 1rem 0; opacity: 0.8; }
    code { background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 0.5rem; }
    .tip { margin-top: 2rem; opacity: 0.6; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <code>${pathname}</code>
    <p class="tip">Create <code>app${pathname === '/' ? '' : pathname}/page.tsx</code> to add this route</p>
  </div>
</body>
</html>`;
}

function createErrorPage(error: Error): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error | Float.js</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Monaco', 'Menlo', monospace;
      background: #1a1a1a;
      color: #ff6b6b;
      min-height: 100vh;
      padding: 2rem;
    }
    .header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .icon { font-size: 2rem; }
    h1 { font-size: 1.5rem; }
    .message { color: #ffa94d; font-size: 1.25rem; margin-bottom: 1rem; }
    .stack { 
      background: #2d2d2d; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      overflow-x: auto;
      color: #888;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="icon">⚠️</span>
    <h1>Server Error</h1>
  </div>
  <p class="message">${escapeHtml(error.message)}</p>
  <pre class="stack">${escapeHtml(error.stack || '')}</pre>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
