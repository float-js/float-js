#!/usr/bin/env node
/**
 * create-float
 * Create Float.js applications with one command
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const banner = `
${pc.cyan('╔═══════════════════════════════════════╗')}
${pc.cyan('║')}  ${pc.bold(pc.magenta('⚡ Create Float.js App'))}             ${pc.cyan('║')}
${pc.cyan('║')}  ${pc.dim('Ultra Modern Web Framework')}          ${pc.cyan('║')}
${pc.cyan('╚═══════════════════════════════════════╝')}
`;

interface Template {
  name: string;
  description: string;
  value: string;
}

const templates: Template[] = [
  { 
    name: 'Default', 
    description: 'Basic Float.js app with TypeScript',
    value: 'default',
  },
  { 
    name: 'Minimal', 
    description: 'Bare minimum setup',
    value: 'minimal',
  },
  { 
    name: 'Full Stack', 
    description: 'With API routes and database ready',
    value: 'fullstack',
  },
];

async function main() {
  console.log(banner);

  // Get project name from args or prompt
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-float-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) return 'Invalid project name';
        return true;
      },
    });

    if (!response.projectName) {
      console.log(pc.red('\n❌ Project creation cancelled\n'));
      process.exit(1);
    }

    projectName = response.projectName;
  }

  // Select template
  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: 'Select a template:',
    choices: templates.map(t => ({
      title: `${t.name} ${pc.dim(`- ${t.description}`)}`,
      value: t.value,
    })),
  });

  if (!template) {
    console.log(pc.red('\n❌ Project creation cancelled\n'));
    process.exit(1);
  }

  // Additional options
  const { typescript, tailwind, eslint } = await prompts([
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Add Tailwind CSS?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Add ESLint?',
      initial: true,
    },
  ]);

  const projectDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(pc.red('\n❌ Project creation cancelled\n'));
      process.exit(1);
    }

    fs.rmSync(projectDir, { recursive: true });
  }

  console.log(pc.cyan(`\n📁 Creating project in ${pc.bold(projectDir)}...\n`));

  // Create project structure
  createProject(projectDir, {
    name: projectName,
    template,
    typescript,
    tailwind,
    eslint,
  });

  // Success message
  console.log(pc.green('\n✅ Project created successfully!\n'));
  console.log(pc.bold('Next steps:\n'));
  console.log(`  ${pc.cyan('cd')} ${projectName}`);
  console.log(`  ${pc.cyan('pnpm')} install ${pc.dim('# or npm install')}`);
  console.log(`  ${pc.cyan('pnpm')} dev ${pc.dim('# or npm run dev')}`);
  console.log('');
  console.log(pc.dim('Happy coding with Float.js! ⚡\n'));
}

interface ProjectOptions {
  name: string;
  template: string;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
}

function createProject(projectDir: string, options: ProjectOptions) {
  const { name, typescript, tailwind, eslint } = options;
  const ext = typescript ? 'tsx' : 'jsx';

  fs.mkdirSync(projectDir, { recursive: true });

  // Create package.json
  const packageJson = {
    name,
    version: '2.0.1',
    private: true,
    type: 'module',
    scripts: {
      dev: 'float dev',
      build: 'float build',
      start: 'float start',
      lint: eslint ? 'eslint . --ext .ts,.tsx' : undefined,
    },
    dependencies: {
      '@float/core': '^2.0.1',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      ...(typescript && {
        typescript: '^5.3.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@types/node': '^20.10.0',
      }),
      ...(tailwind && {
        tailwindcss: '^3.4.0',
        autoprefixer: '^10.4.0',
        postcss: '^8.4.0',
      }),
      ...(eslint && {
        eslint: '^8.56.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
      }),
    },
  };

  // Remove undefined values
  Object.keys(packageJson.scripts).forEach(key => {
    if ((packageJson.scripts as any)[key] === undefined) {
      delete (packageJson.scripts as any)[key];
    }
  });

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create TypeScript config
  if (typescript) {
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'react-jsx',
        incremental: true,
        paths: {
          '@/*': ['./app/*'],
        },
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    };

    fs.writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
  }

  // Create float.config.ts
  const floatConfig = typescript
    ? `import type { FloatConfig } from '@float/core';

const config: FloatConfig = {
  reactStrictMode: true,
};

export default config;
`
    : `/** @type {import('@float/core').FloatConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
`;

  fs.writeFileSync(
    path.join(projectDir, typescript ? 'float.config.ts' : 'float.config.js'),
    floatConfig
  );

  // Create app directory
  const appDir = path.join(projectDir, 'app');
  fs.mkdirSync(appDir, { recursive: true });

  // Create root layout
  const layoutContent = typescript
    ? `import type { ReactNode } from 'react';
import type { Metadata } from '@float/core';
${tailwind ? "import './globals.css';" : ''}

export const metadata: Metadata = {
  title: {
    default: '${name}',
    template: '%s | ${name}',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    : `${tailwind ? "import './globals.css';" : ''}

export const metadata = {
  title: {
    default: '${name}',
    template: '%s | ${name}',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  fs.writeFileSync(path.join(appDir, `layout.${ext}`), layoutContent);

  // Create Float.js Welcome Home Page
  const pageContent = `export const metadata = {
  title: 'Welcome to Float.js',
};

export default function HomePage() {
  return (
    <>
      <style>{\`
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
        
        .bg-gradient {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.15), transparent);
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
        }
        
        .orb-2 {
          width: 300px;
          height: 300px;
          background: var(--float-pink);
          bottom: -50px;
          left: -50px;
          animation-delay: -7s;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
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
        
        .logo {
          margin-bottom: 48px;
          animation: fadeInUp 0.8s ease-out;
        }
        
        .logo svg {
          width: 80px;
          height: 80px;
          filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.5));
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hero { text-align: center; margin-bottom: 64px; }
        
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
        
        .feature h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .feature p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }
        
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
        
        .code-dots { display: flex; gap: 6px; }
        .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .code-dot:nth-child(1) { background: #ff5f57; }
        .code-dot:nth-child(2) { background: #febc2e; }
        .code-dot:nth-child(3) { background: #28c840; }
        
        .code-title { margin-left: auto; font-size: 12px; color: rgba(255,255,255,0.4); }
        
        .code-block {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0 0 16px 16px;
          padding: 24px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          line-height: 1.8;
        }
        
        .code-line { display: flex; }
        .code-number { color: rgba(255,255,255,0.2); width: 40px; user-select: none; }
        .code-content { color: rgba(255,255,255,0.8); }
        .code-keyword { color: #c792ea; }
        .code-string { color: #c3e88d; }
        .code-function { color: #82aaff; }
        .code-tag { color: #f07178; }
        
        .edit-hint {
          text-align: center;
          animation: fadeInUp 0.8s ease-out 0.7s both;
        }
        
        .edit-hint p {
          color: rgba(255,255,255,0.4);
          font-size: 14px;
        }
        
        .edit-hint code {
          background: rgba(255,255,255,0.1);
          padding: 4px 12px;
          border-radius: 6px;
          color: var(--float-purple);
        }
        
        .footer {
          position: absolute;
          bottom: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }
      \`}</style>
      
      <div className="bg-gradient" />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      
      <div className="container">
        <div className="logo">
          <svg viewBox="0 0 80 80" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="50%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#d946ef"/>
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="36" stroke="url(#logoGrad)" strokeWidth="3" fill="none">
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite"/>
            </circle>
            <circle cx="40" cy="40" r="28" stroke="url(#logoGrad)" strokeWidth="2" fill="none" opacity="0.5">
              <animateTransform attributeName="transform" type="rotate" from="360 40 40" to="0 40 40" dur="15s" repeatCount="indefinite"/>
            </circle>
            <path d="M30 28 L54 40 L30 52 Z" fill="url(#logoGrad)"/>
          </svg>
        </div>
        
        <div className="hero">
          <h1>Welcome to <span className="gradient">Float.js</span></h1>
          <p>Tu framework ultramoderno está listo. Comienza a crear experiencias web increíbles con SSR, routing inteligente y desarrollo instantáneo.</p>
        </div>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Desarrollo Instantáneo</h3>
            <p>Hot reload ultrarrápido con esbuild. Ve tus cambios al instante.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Routing Inteligente</h3>
            <p>Sistema de rutas basado en archivos. Crea page.tsx y listo.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌊</div>
            <h3>SSR Streaming</h3>
            <p>Renderizado del servidor con React 18 y streaming nativo.</p>
          </div>
        </div>
        
        <div className="code-section">
          <div className="code-header">
            <div className="code-dots">
              <div className="code-dot" />
              <div className="code-dot" />
              <div className="code-dot" />
            </div>
            <span className="code-title">app/page.tsx</span>
          </div>
          <div className="code-block">
            <div className="code-line">
              <span className="code-number">1</span>
              <span className="code-content"><span className="code-keyword">export default function</span> <span className="code-function">HomePage</span>() {"{"}</span>
            </div>
            <div className="code-line">
              <span className="code-number">2</span>
              <span className="code-content">  <span className="code-keyword">return</span> <span className="code-tag">&lt;h1&gt;</span>Hello Float!<span className="code-tag">&lt;/h1&gt;</span>;</span>
            </div>
            <div className="code-line">
              <span className="code-number">3</span>
              <span className="code-content">{"}"}</span>
            </div>
          </div>
        </div>
        
        <div className="edit-hint">
          <p>Edita <code>app/page.tsx</code> para comenzar</p>
        </div>
        
        <div className="footer">
          Float.js v2.0.1 — Made with ⚡ for the modern web
        </div>
      </div>
    </>
  );
}
`;

  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  // Create Tailwind files if enabled
  if (tailwind) {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-rgb: 10, 10, 10;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;

    fs.writeFileSync(path.join(appDir, 'globals.css'), globalsCss);

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

    fs.writeFileSync(path.join(projectDir, 'tailwind.config.js'), tailwindConfig);

    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

    fs.writeFileSync(path.join(projectDir, 'postcss.config.js'), postcssConfig);
  }

  // Create public directory
  fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true });

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build
.float/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Env
.env
.env.local
`;

  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

  // Create README
  const readme = `# ${name}

Built with [Float.js](https://github.com/float/float.js) - Ultra Modern Web Framework

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## Learn More

- [Float.js Documentation](https://float.js.org/docs)
- [Examples](https://github.com/float/float.js/tree/main/examples)
`;

  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
}

main().catch(console.error);
