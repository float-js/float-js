/**
 * Float.js Welcome Page
 * Shown when users first install the framework
 */

export function generateWelcomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Float.js</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%236366f1'/><stop offset='100%25' stop-color='%23d946ef'/></linearGradient></defs><circle cx='16' cy='16' r='14' fill='url(%23g)'/></svg>">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --float-purple: #8b5cf6;
      --float-indigo: #6366f1;
      --float-pink: #d946ef;
      --float-cyan: #06b6d4;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0b;
      color: white;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Animated background */
    .bg-gradient {
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent),
        radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.15), transparent),
        radial-gradient(ellipse 40% 30% at 20% 80%, rgba(217, 70, 239, 0.1), transparent);
      pointer-events: none;
    }
    
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }
    
    /* Floating orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      animation: float 20s ease-in-out infinite;
      pointer-events: none;
    }
    
    .orb-1 {
      width: 400px;
      height: 400px;
      background: var(--float-purple);
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }
    
    .orb-2 {
      width: 300px;
      height: 300px;
      background: var(--float-pink);
      bottom: -50px;
      left: -50px;
      animation-delay: -7s;
    }
    
    .orb-3 {
      width: 200px;
      height: 200px;
      background: var(--float-cyan);
      top: 50%;
      left: 50%;
      animation-delay: -14s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30px, -30px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.9); }
      75% { transform: translate(20px, 10px) scale(1.05); }
    }
    
    /* Main content */
    .container {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    /* Logo */
    .logo {
      margin-bottom: 48px;
      animation: fadeInUp 0.8s ease-out;
    }
    
    .logo svg {
      width: 80px;
      height: 80px;
      filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.5));
    }
    
    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 64px;
    }
    
    .hero h1 {
      font-size: clamp(48px, 10vw, 80px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 24px;
      animation: fadeInUp 0.8s ease-out 0.1s both;
    }
    
    .hero h1 .gradient {
      background: linear-gradient(135deg, var(--float-indigo), var(--float-purple), var(--float-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero p {
      font-size: 20px;
      color: rgba(255,255,255,0.6);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.7;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }
    
    /* Features */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 900px;
      margin-bottom: 64px;
    }
    
    .feature {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      padding: 28px;
      transition: all 0.3s ease;
      animation: fadeInUp 0.8s ease-out both;
    }
    
    .feature:nth-child(1) { animation-delay: 0.3s; }
    .feature:nth-child(2) { animation-delay: 0.4s; }
    .feature:nth-child(3) { animation-delay: 0.5s; }
    
    .feature:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(139, 92, 246, 0.3);
      transform: translateY(-4px);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 24px;
    }
    
    .feature h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .feature p {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
    }
    
    /* Code block */
    .code-section {
      width: 100%;
      max-width: 600px;
      animation: fadeInUp 0.8s ease-out 0.6s both;
      margin-bottom: 48px;
    }
    
    .code-header {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-bottom: none;
      border-radius: 16px 16px 0 0;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .code-dots {
      display: flex;
      gap: 6px;
    }
    
    .code-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
    }
    
    .code-dot:nth-child(1) { background: #ff5f57; }
    .code-dot:nth-child(2) { background: #febc2e; }
    .code-dot:nth-child(3) { background: #28c840; }
    
    .code-title {
      margin-left: auto;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }
    
    .code-block {
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 0 0 16px 16px;
      padding: 24px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      line-height: 1.8;
      overflow-x: auto;
    }
    
    .code-line {
      display: flex;
    }
    
    .code-number {
      color: rgba(255,255,255,0.2);
      width: 40px;
      flex-shrink: 0;
      user-select: none;
    }
    
    .code-content {
      color: rgba(255,255,255,0.8);
    }
    
    .code-keyword { color: #c792ea; }
    .code-string { color: #c3e88d; }
    .code-function { color: #82aaff; }
    .code-comment { color: rgba(255,255,255,0.3); }
    .code-tag { color: #f07178; }
    .code-attr { color: #ffcb6b; }
    
    /* Quick start */
    .quick-start {
      text-align: center;
      animation: fadeInUp 0.8s ease-out 0.7s both;
    }
    
    .quick-start h2 {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 20px;
    }
    
    .quick-start-cmd {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px 24px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-start-cmd:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(139, 92, 246, 0.4);
    }
    
    .quick-start-cmd .prompt {
      color: var(--float-purple);
    }
    
    .quick-start-cmd .text {
      color: rgba(255,255,255,0.8);
    }
    
    .quick-start-cmd .copy {
      opacity: 0.4;
      transition: opacity 0.2s;
    }
    
    .quick-start-cmd:hover .copy {
      opacity: 0.8;
    }
    
    /* Links */
    .links {
      display: flex;
      gap: 24px;
      margin-top: 48px;
      animation: fadeInUp 0.8s ease-out 0.8s both;
    }
    
    .link {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }
    
    .link:hover {
      color: var(--float-purple);
    }
    
    /* Footer */
    .footer {
      position: absolute;
      bottom: 24px;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      animation: fadeInUp 0.8s ease-out 0.9s both;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .container { padding: 40px 20px; }
      .hero h1 { font-size: 40px; }
      .hero p { font-size: 16px; }
      .features { gap: 16px; }
      .feature { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="bg-grid"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  
  <div class="container">
    <div class="logo">
      <svg viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="50%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#d946ef"/>
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" stroke="url(#logoGrad)" stroke-width="3" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite"/>
        </circle>
        <circle cx="40" cy="40" r="28" stroke="url(#logoGrad)" stroke-width="2" fill="none" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="360 40 40" to="0 40 40" dur="15s" repeatCount="indefinite"/>
        </circle>
        <path d="M30 28 L54 40 L30 52 Z" fill="url(#logoGrad)"/>
      </svg>
    </div>
    
    <div class="hero">
      <h1>Welcome to <span class="gradient">Float.js</span></h1>
      <p>Tu framework ultramoderno está listo. Comienza a crear experiencias web increíbles con SSR, routing inteligente y desarrollo instantáneo.</p>
    </div>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Desarrollo Instantáneo</h3>
        <p>Hot reload ultrarrápido con esbuild. Ve tus cambios al instante sin perder el estado.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎯</div>
        <h3>Routing Inteligente</h3>
        <p>Sistema de rutas basado en archivos. Crea page.tsx y tu ruta está lista automáticamente.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🌊</div>
        <h3>SSR Streaming</h3>
        <p>Renderizado del lado del servidor con React 18 y soporte para streaming nativo.</p>
      </div>
    </div>
    
    <div class="code-section">
      <div class="code-header">
        <div class="code-dots">
          <div class="code-dot"></div>
          <div class="code-dot"></div>
          <div class="code-dot"></div>
        </div>
        <span class="code-title">app/page.tsx</span>
      </div>
      <div class="code-block">
        <div class="code-line">
          <span class="code-number">1</span>
          <span class="code-content"><span class="code-keyword">export default function</span> <span class="code-function">HomePage</span>() {</span>
        </div>
        <div class="code-line">
          <span class="code-number">2</span>
          <span class="code-content">  <span class="code-keyword">return</span> (</span>
        </div>
        <div class="code-line">
          <span class="code-number">3</span>
          <span class="code-content">    <span class="code-tag">&lt;h1&gt;</span>Hello, Float.js!<span class="code-tag">&lt;/h1&gt;</span></span>
        </div>
        <div class="code-line">
          <span class="code-number">4</span>
          <span class="code-content">  );</span>
        </div>
        <div class="code-line">
          <span class="code-number">5</span>
          <span class="code-content">}</span>
        </div>
      </div>
    </div>
    
    <div class="quick-start">
      <h2>Crea tu primera página</h2>
      <div class="quick-start-cmd" onclick="navigator.clipboard.writeText('touch app/about/page.tsx')">
        <span class="prompt">$</span>
        <span class="text">touch app/about/page.tsx</span>
        <span class="copy">📋</span>
      </div>
    </div>
    
    <div class="links">
      <a href="https://floatjs.dev/docs" target="_blank" class="link">
        <span>📖</span> Documentación
      </a>
      <a href="https://github.com/floatjs/float" target="_blank" class="link">
        <span>⭐</span> GitHub
      </a>
      <a href="https://floatjs.dev/examples" target="_blank" class="link">
        <span>🎨</span> Ejemplos
      </a>
    </div>
    
    <div class="footer">
      Float.js v2.0.1 — Made with ⚡ for the modern web
    </div>
  </div>
</body>
</html>`;
}
