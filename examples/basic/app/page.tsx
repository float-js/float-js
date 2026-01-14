export const metadata = {
  title: 'Float.js - The Web Framework for the AI Era',
  description: 'Build blazingly fast web applications with Float.js. SSR, streaming, intelligent routing, and AI-ready architecture.',
};

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --float-purple: #8b5cf6;
          --float-indigo: #6366f1;
          --float-pink: #ec4899;
          --float-cyan: #06b6d4;
          --float-blue: #3b82f6;
          --float-green: #10b981;
          --float-bg: #000000;
          --float-bg-secondary: #0a0a0a;
          --float-border: rgba(255,255,255,0.08);
          --float-text: #fafafa;
          --float-text-secondary: #a1a1aa;
        }
        
        html { scroll-behavior: smooth; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--float-bg);
          color: var(--float-text);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.6;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0 24px;
          backdrop-filter: blur(12px) saturate(180%);
          background: rgba(0,0,0,0.7);
          border-bottom: 1px solid var(--float-border);
        }
        
        .navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--float-text);
          font-weight: 700;
          font-size: 18px;
        }
        
        .navbar-brand svg { width: 28px; height: 28px; }
        
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        
        .navbar-link {
          color: var(--float-text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .navbar-link:hover { color: var(--float-text); }
        
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }
        
        .btn-ghost {
          background: transparent;
          color: var(--float-text-secondary);
        }
        
        .btn-ghost:hover {
          background: rgba(255,255,255,0.05);
          color: var(--float-text);
        }
        
        .btn-primary {
          background: var(--float-text);
          color: var(--float-bg);
        }
        
        .btn-primary:hover {
          background: #e4e4e7;
          transform: translateY(-1px);
        }
        
        .btn-gradient {
          background: linear-gradient(135deg, var(--float-purple) 0%, var(--float-pink) 100%);
          color: white;
          border: none;
        }
        
        .btn-gradient:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
        }
        
        .btn-lg {
          padding: 14px 28px;
          font-size: 16px;
          border-radius: 10px;
        }
        
        .btn-outline {
          background: transparent;
          color: var(--float-text);
          border: 1px solid var(--float-border);
        }
        
        .btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          text-align: center;
          overflow: hidden;
        }
        
        .hero-glow {
          position: absolute;
          width: 1000px;
          height: 1000px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          animation: pulseGlow 8s ease-in-out infinite;
        }
        
        .hero-glow-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
          bottom: -200px;
          right: -100px;
          pointer-events: none;
          animation: pulseGlow 12s ease-in-out infinite reverse;
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
        }
        
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent);
          pointer-events: none;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 8px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 100px;
          font-size: 13px;
          color: #c4b5fd;
          margin-bottom: 32px;
          animation: fadeInUp 0.6s ease-out;
          transition: all 0.2s;
        }
        
        .hero-badge:hover {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.15);
        }
        
        .hero-badge-new {
          background: linear-gradient(135deg, var(--float-purple), var(--float-pink));
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .hero-title {
          font-size: clamp(52px, 9vw, 88px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin-bottom: 28px;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }
        
        .hero-title-line { display: block; }
        
        .hero-title-gradient {
          background: linear-gradient(135deg, #fff 0%, #fff 30%, var(--float-purple) 70%, var(--float-pink) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: clamp(18px, 2.2vw, 21px);
          color: var(--float-text-secondary);
          max-width: 620px;
          margin-bottom: 48px;
          line-height: 1.7;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }
        
        .hero-code {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 72px;
          padding: 16px 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--float-border);
          border-radius: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }
        
        .hero-code-prefix { color: var(--float-text-secondary); }
        .hero-code-command { color: var(--float-cyan); }
        
        .hero-code-copy {
          padding: 8px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 6px;
          color: var(--float-text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-code-copy:hover {
          background: rgba(255,255,255,0.1);
          color: var(--float-text);
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .features {
          position: relative;
          padding: 140px 24px;
          background: var(--float-bg-secondary);
          border-top: 1px solid var(--float-border);
        }
        
        .features-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }
        
        .section-badge {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--float-indigo);
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        
        .section-subtitle {
          font-size: 18px;
          color: var(--float-text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .feature-card {
          position: relative;
          padding: 36px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--float-border);
          border-radius: 20px;
          transition: all 0.3s;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .feature-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .feature-card:hover::before { opacity: 1; }
        
        .feature-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--float-purple) 0%, var(--float-pink) 100%);
          border-radius: 14px;
          font-size: 24px;
          margin-bottom: 24px;
        }
        
        .feature-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        
        .feature-desc {
          color: var(--float-text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }

        .showcase {
          padding: 140px 24px;
          border-top: 1px solid var(--float-border);
        }
        
        .showcase-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        
        .showcase-content h2 {
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          line-height: 1.15;
        }
        
        .showcase-content p {
          color: var(--float-text-secondary);
          font-size: 17px;
          line-height: 1.8;
          margin-bottom: 32px;
        }
        
        .showcase-list {
          list-style: none;
        }
        
        .showcase-list li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          color: var(--float-text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }
        
        .showcase-check {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(16, 185, 129, 0.1);
          color: var(--float-green);
          border-radius: 50%;
          font-size: 11px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .code-window {
          background: #0d0d0d;
          border: 1px solid var(--float-border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 30px 100px rgba(0,0,0,0.5);
        }
        
        .code-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid var(--float-border);
        }
        
        .code-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .code-dot-red { background: #ff5f57; }
        .code-dot-yellow { background: #ffbd2e; }
        .code-dot-green { background: #28c840; }
        
        .code-title {
          margin-left: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--float-text-secondary);
        }
        
        .code-body {
          padding: 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          line-height: 1.7;
          overflow-x: auto;
        }
        
        .code-body pre { margin: 0; }
        
        .c-kw { color: #c678dd; }
        .c-fn { color: #61afef; }
        .c-str { color: #98c379; }
        .c-cmp { color: #e5c07b; }
        .c-prop { color: #d19a66; }
        .c-com { color: #5c6370; font-style: italic; }
        .c-tag { color: #e06c75; }
        .c-attr { color: #d19a66; }
        .c-num { color: #d19a66; }

        .stats {
          padding: 100px 24px;
          background: var(--float-bg-secondary);
          border-top: 1px solid var(--float-border);
          border-bottom: 1px solid var(--float-border);
        }
        
        .stats-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--float-purple) 0%, var(--float-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--float-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cta {
          position: relative;
          padding: 180px 24px;
          text-align: center;
          overflow: hidden;
        }
        
        .cta-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          bottom: -300px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        
        .cta h2 {
          font-size: clamp(40px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          line-height: 1.1;
        }
        
        .cta p {
          font-size: 19px;
          color: var(--float-text-secondary);
          max-width: 520px;
          margin: 0 auto 48px;
          line-height: 1.7;
        }

        .footer {
          padding: 80px 24px 48px;
          border-top: 1px solid var(--float-border);
        }
        
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 64px;
          margin-bottom: 64px;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 16px;
        }
        
        .footer-brand svg { width: 24px; height: 24px; }
        
        .footer-desc {
          color: var(--float-text-secondary);
          font-size: 14px;
          line-height: 1.7;
          max-width: 280px;
        }
        
        .footer-column h4 {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--float-text);
          margin-bottom: 20px;
        }
        
        .footer-links {
          list-style: none;
        }
        
        .footer-links li { margin-bottom: 14px; }
        
        .footer-links a {
          color: var(--float-text-secondary);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        
        .footer-links a:hover { color: var(--float-text); }
        
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          border-top: 1px solid var(--float-border);
          font-size: 13px;
          color: var(--float-text-secondary);
        }
        
        .footer-social {
          display: flex;
          gap: 20px;
        }
        
        .footer-social a {
          color: var(--float-text-secondary);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        
        .footer-social a:hover { color: var(--float-text); }

        @media (max-width: 1024px) {
          .showcase-inner { grid-template-columns: 1fr; gap: 56px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 40px; }
          .footer-grid { grid-template-columns: repeat(3, 1fr); gap: 40px; }
        }
        
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-inner { gap: 32px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 20px; text-align: center; }
        }
      `}} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-brand">
            <svg viewBox="0 0 200 200" fill="none">
              <defs>
                <linearGradient id="paint0_linear_float" x1="50" y1="145" x2="120" y2="145" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_float" x1="50" y1="100" x2="150" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
                <linearGradient id="paint2_linear_float" x1="50" y1="55" x2="170" y2="55" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
              <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#paint0_linear_float)"/>
              <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#paint1_linear_float)"/>
              <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#paint2_linear_float)"/>
            </svg>
            Float.js
          </a>
          
          <div className="navbar-links">
            <a href="#features" className="navbar-link">Features</a>
            <a href="/docs" className="navbar-link">Docs</a>
            <a href="/examples" className="navbar-link">Examples</a>
            <a href="/blog" className="navbar-link">Blog</a>
            <a href="/enterprise" className="navbar-link">Enterprise</a>
          </div>
          
          <div className="navbar-actions">
            <a href="https://github.com/float-js/float" className="btn btn-ghost">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a href="/docs/getting-started" className="btn btn-primary">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-grid" />
        
        {/* Float Logo */}
        <div style={{ marginBottom: '32px' }}>
          <svg width="100" height="100" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="hero-paint0" x1="50" y1="145" x2="120" y2="145" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
              <linearGradient id="hero-paint1" x1="50" y1="100" x2="150" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
              <linearGradient id="hero-paint2" x1="50" y1="55" x2="170" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
            <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#hero-paint0)"/>
            <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#hero-paint1)"/>
            <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#hero-paint2)"/>
          </svg>
        </div>
        
        <a href="/blog/float-1.0" className="hero-badge">
          <span className="hero-badge-new">New</span>
          Float.js 1.0 is here — Read the announcement →
        </a>
        
        <h1 className="hero-title">
          <span className="hero-title-line">The React Framework</span>
          <span className="hero-title-line hero-title-gradient">for the AI Era</span>
        </h1>
        
        <p className="hero-subtitle">
          Build blazingly fast web applications with intelligent SSR, streaming rendering, 
          file-based routing, and an architecture designed for the AI-powered future.
        </p>
        
        <div className="hero-actions">
          <a href="/docs/getting-started" className="btn btn-gradient btn-lg">
            Start Building
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="/docs" className="btn btn-outline btn-lg">
            Documentation
          </a>
        </div>
        
        <div className="hero-code">
          <span className="hero-code-prefix">$</span>
          <span className="hero-code-command">npx create-float@latest my-app</span>
          <button className="hero-code-copy" title="Copy to clipboard">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="features-inner">
          <div className="section-header">
            <div className="section-badge">Features</div>
            <h2 className="section-title">Everything you need to ship fast</h2>
            <p className="section-subtitle">
              Float.js provides all the tools you need to build modern web applications 
              with the best developer experience.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Hot Reload</h3>
              <p className="feature-desc">
                Lightning-fast refresh with esbuild. See your changes in milliseconds, 
                not seconds. State preservation built-in.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">File-Based Routing</h3>
              <p className="feature-desc">
                Create page.tsx and you have a route. Dynamic segments, catch-all routes, 
                and parallel routes out of the box.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌊</div>
              <h3 className="feature-title">Streaming SSR</h3>
              <p className="feature-desc">
                React 18 streaming with Suspense boundaries. Progressive HTML delivery 
                for the fastest time-to-content.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔮</div>
              <h3 className="feature-title">AI-Ready Architecture</h3>
              <p className="feature-desc">
                Built-in patterns for AI integration. Server actions, streaming responses, 
                and optimized for LLM workflows.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3 className="feature-title">Zero Config</h3>
              <p className="feature-desc">
                Start coding immediately. TypeScript, ESLint, and optimal defaults 
                configured out of the box.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Edge Ready</h3>
              <p className="feature-desc">
                Deploy anywhere. Optimized for edge runtimes, serverless, and traditional 
                Node.js environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Showcase */}
      <section className="showcase">
        <div className="showcase-inner">
          <div className="showcase-content">
            <h2>Write less code.<br />Build more features.</h2>
            <p>
              Float.js conventions eliminate boilerplate. Focus on your product logic 
              while the framework handles the complexity of modern web development.
            </p>
            <ul className="showcase-list">
              <li>
                <span className="showcase-check">✓</span>
                Automatic code splitting per route
              </li>
              <li>
                <span className="showcase-check">✓</span>
                Built-in layouts and nested routing
              </li>
              <li>
                <span className="showcase-check">✓</span>
                Server and client components
              </li>
              <li>
                <span className="showcase-check">✓</span>
                Integrated data fetching
              </li>
              <li>
                <span className="showcase-check">✓</span>
                Automatic static optimization
              </li>
            </ul>
          </div>
          
          <div className="code-window">
            <div className="code-header">
              <div className="code-dot code-dot-red" />
              <div className="code-dot code-dot-yellow" />
              <div className="code-dot code-dot-green" />
              <span className="code-title">app/users/[id]/page.tsx</span>
            </div>
            <div className="code-body">
              <pre>{`<span class="c-com">// Dynamic route with data fetching</span>
<span class="c-kw">export default async function</span> <span class="c-fn">UserPage</span>({ 
  params 
}: { 
  params: { id: <span class="c-cmp">string</span> } 
}) {
  <span class="c-kw">const</span> user = <span class="c-kw">await</span> <span class="c-fn">getUser</span>(params.id);
  
  <span class="c-kw">return</span> (
    <span class="c-tag">&lt;div</span> <span class="c-attr">className</span>=<span class="c-str">"profile"</span><span class="c-tag">&gt;</span>
      <span class="c-tag">&lt;h1&gt;</span>{user.name}<span class="c-tag">&lt;/h1&gt;</span>
      <span class="c-tag">&lt;p&gt;</span>{user.email}<span class="c-tag">&lt;/p&gt;</span>
    <span class="c-tag">&lt;/div&gt;</span>
  );
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-inner">
          <div>
            <div className="stat-value">10x</div>
            <div className="stat-label">Faster Builds</div>
          </div>
          <div>
            <div className="stat-value">50ms</div>
            <div className="stat-label">Hot Reload</div>
          </div>
          <div>
            <div className="stat-value">100</div>
            <div className="stat-label">Lighthouse Score</div>
          </div>
          <div>
            <div className="stat-value">0</div>
            <div className="stat-label">Config Files</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-glow" />
        <h2>Ready to build the future?</h2>
        <p>
          Join thousands of developers building faster, smarter applications with Float.js.
        </p>
        <div className="hero-actions">
          <a href="/docs/getting-started" className="btn btn-gradient btn-lg">
            Get Started for Free
          </a>
          <a href="https://github.com/float-js/float" className="btn btn-outline btn-lg">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
                  <defs>
                    <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle cx="16" cy="16" r="14" fill="url(#logo-grad-2)" />
                </svg>
                Float.js
              </div>
              <p className="footer-desc">
                The React framework for building fast, modern web applications. 
                Open source and free forever.
              </p>
            </div>
            
            <div className="footer-column">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><a href="/docs">Documentation</a></li>
                <li><a href="/learn">Learn Float.js</a></li>
                <li><a href="/examples">Examples</a></li>
                <li><a href="/templates">Templates</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Community</h4>
              <ul className="footer-links">
                <li><a href="https://github.com/float-js/float">GitHub</a></li>
                <li><a href="https://discord.gg/float">Discord</a></li>
                <li><a href="https://twitter.com/floatjs">Twitter</a></li>
                <li><a href="/blog">Blog</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="/about">About</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/enterprise">Enterprise</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/terms">Terms</a></li>
                <li><a href="/license">License</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div>© 2026 Float.js. All rights reserved.</div>
            <div className="footer-social">
              <a href="https://github.com/float-js/float" aria-label="GitHub">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="https://twitter.com/floatjs" aria-label="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://discord.gg/float" aria-label="Discord">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
