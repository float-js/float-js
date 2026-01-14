/**
 * Float.js Welcome Page
 * Modern, minimal welcome screen inspired by Next.js
 */

export function generateWelcomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Float.js</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0%25' y1='100%25' x2='100%25' y2='0%25'><stop offset='0%25' stop-color='%233B82F6'/><stop offset='100%25' stop-color='%238B5CF6'/></linearGradient></defs><path d='M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z' fill='url(%23g)'/><path d='M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z' fill='url(%23g)'/><path d='M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z' fill='url(%23g)'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    
    .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
    .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s forwards; opacity: 0; }
    .animate-fade-in-delay-2 { animation: fade-in 0.8s ease-out 0.4s forwards; opacity: 0; }
    .animate-fade-in-delay-3 { animation: fade-in 0.8s ease-out 0.6s forwards; opacity: 0; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  </style>
</head>
<body class="bg-black text-white min-h-screen flex flex-col">
  
  <!-- Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden">
    <!-- Gradient orbs -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 2s;"></div>
    
    <!-- Grid pattern -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
  </div>
  
  <!-- Main Content -->
  <main class="flex-1 flex items-center justify-center px-6 relative z-10">
    <div class="max-w-2xl w-full text-center">
      
      <!-- Logo -->
      <div class="animate-fade-in animate-float mb-8">
        <svg class="w-20 h-20 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-gradient" x1="50" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3B82F6"/>
              <stop offset="1" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#logo-gradient)"/>
          <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#logo-gradient)"/>
          <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#logo-gradient)"/>
        </svg>
      </div>
      
      <!-- Title -->
      <h1 class="animate-fade-in-delay text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
        Welcome to <span class="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Float.js</span>
      </h1>
      
      <!-- Subtitle -->
      <p class="animate-fade-in-delay-2 text-lg text-zinc-400 mb-12 max-w-md mx-auto">
        The React framework built for speed. Get started by editing your first page.
      </p>
      
      <!-- Code Block -->
      <div class="animate-fade-in-delay-3 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 mb-8 text-left">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
          <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
          <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
          <span class="ml-3 text-xs text-zinc-500 font-mono">app/page.tsx</span>
        </div>
        <pre class="text-sm font-mono overflow-x-auto"><code><span class="text-violet-400">export default</span> <span class="text-blue-400">function</span> <span class="text-yellow-300">Page</span>() {
  <span class="text-violet-400">return</span> (
    <span class="text-zinc-500">&lt;</span><span class="text-blue-300">h1</span><span class="text-zinc-500">&gt;</span><span class="text-zinc-300">Hello, Float.js!</span><span class="text-zinc-500">&lt;/</span><span class="text-blue-300">h1</span><span class="text-zinc-500">&gt;</span>
  );
}</code></pre>
      </div>
      
      <!-- Action Buttons -->
      <div class="animate-fade-in-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
        <a href="https://floatjs.dev/docs" target="_blank" 
           class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          Read the Docs
        </a>
        <a href="https://github.com/float-js/float-js" target="_blank"
           class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </div>
      
      <!-- Quick Commands -->
      <div class="animate-fade-in-delay-3 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
          <div class="text-xs text-zinc-500 mb-1 font-mono">Create page</div>
          <code class="text-sm text-zinc-300 font-mono">mkdir app && touch app/page.tsx</code>
        </div>
        <div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
          <div class="text-xs text-zinc-500 mb-1 font-mono">Add route</div>
          <code class="text-sm text-zinc-300 font-mono">touch app/about/page.tsx</code>
        </div>
        <div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
          <div class="text-xs text-zinc-500 mb-1 font-mono">API route</div>
          <code class="text-sm text-zinc-300 font-mono">touch app/api/route.ts</code>
        </div>
      </div>
      
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="relative z-10 border-t border-zinc-800/50 py-8 px-6">
    <div class="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      
      <!-- Left: Logo + Version -->
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="footer-gradient" x1="50" y1="160" x2="170" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3B82F6"/>
              <stop offset="1" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M50 145C50 136.716 56.7157 130 65 130H105C113.284 130 120 136.716 120 145C120 153.284 113.284 160 105 160H65C56.7157 160 50 153.284 50 145Z" fill="url(#footer-gradient)"/>
          <path d="M50 100C50 91.7157 56.7157 85 65 85H135C143.284 85 150 91.7157 150 100C150 108.284 143.284 115 135 115H65C56.7157 115 50 108.284 50 100Z" fill="url(#footer-gradient)"/>
          <path d="M50 55C50 46.7157 56.7157 40 65 40H155C163.284 40 170 46.7157 170 55C170 63.2843 163.284 70 155 70H65C56.7157 70 50 63.2843 50 55Z" fill="url(#footer-gradient)"/>
        </svg>
        <span class="text-sm text-zinc-500">Float.js v2.0.4</span>
      </div>
      
      <!-- Center: Creator Info -->
      <div class="text-center">
        <p class="text-sm text-zinc-400">
          Created by <span class="text-white font-medium">Peter Fulle</span>
        </p>
        <a href="mailto:prfulle@gmail.com" class="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
          prfulle@gmail.com
        </a>
      </div>
      
      <!-- Right: Links -->
      <div class="flex items-center gap-4">
        <a href="https://floatjs.dev" target="_blank" class="text-sm text-zinc-500 hover:text-white transition-colors">Docs</a>
        <a href="https://github.com/float-js/float-js" target="_blank" class="text-sm text-zinc-500 hover:text-white transition-colors">GitHub</a>
        <a href="https://x.com/floatjs" target="_blank" class="text-sm text-zinc-500 hover:text-white transition-colors">Twitter</a>
      </div>
      
    </div>
  </footer>
  
</body>
</html>`;
}
