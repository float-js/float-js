/**
 * Float.js Tailwind CSS Auto-Setup
 * Automatically configures Tailwind CSS for projects
 */

import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

export interface TailwindSetupOptions {
  force?: boolean;
  silent?: boolean;
}

export interface TailwindConfig {
  hasTailwind: boolean;
  configPath: string | null;
  globalsPath: string | null;
  needsSetup: boolean;
}

/**
 * Check if project has Tailwind configured
 */
export function checkTailwindSetup(rootDir: string): TailwindConfig {
  const possibleConfigs = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
  ];

  let configPath: string | null = null;
  
  for (const config of possibleConfigs) {
    const fullPath = path.join(rootDir, config);
    if (fs.existsSync(fullPath)) {
      configPath = fullPath;
      break;
    }
  }

  const globalsPath = path.join(rootDir, 'app', 'globals.css');
  const hasGlobals = fs.existsSync(globalsPath);

  return {
    hasTailwind: !!configPath,
    configPath,
    globalsPath: hasGlobals ? globalsPath : null,
    needsSetup: !configPath || !hasGlobals,
  };
}

/**
 * Auto-setup Tailwind CSS in project
 */
export async function setupTailwind(
  rootDir: string,
  options: TailwindSetupOptions = {}
): Promise<void> {
  const { force = false, silent = false } = options;
  const config = checkTailwindSetup(rootDir);

  if (!force && !config.needsSetup) {
    return;
  }

  if (!silent) {
    console.log(pc.cyan('\n🎨 Setting up Tailwind CSS...'));
  }

  // Create tailwind.config.js
  if (!config.configPath || force) {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

    const configPath = path.join(rootDir, 'tailwind.config.js');
    fs.writeFileSync(configPath, tailwindConfig);
    
    if (!silent) {
      console.log(pc.green('  ✓ Created tailwind.config.js'));
    }
  }

  // Create postcss.config.js
  const postcssPath = path.join(rootDir, 'postcss.config.js');
  if (!fs.existsSync(postcssPath) || force) {
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

    fs.writeFileSync(postcssPath, postcssConfig);
    
    if (!silent) {
      console.log(pc.green('  ✓ Created postcss.config.js'));
    }
  }

  // Create app/globals.css
  const appDir = path.join(rootDir, 'app');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const globalsPath = path.join(appDir, 'globals.css');
  if (!fs.existsSync(globalsPath) || force) {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    fs.writeFileSync(globalsPath, globalsCss);
    
    if (!silent) {
      console.log(pc.green('  ✓ Created app/globals.css'));
    }
  }

  // Create app/layout.tsx if it doesn't exist
  const layoutPath = path.join(appDir, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    const layoutContent = `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

    fs.writeFileSync(layoutPath, layoutContent);
    
    if (!silent) {
      console.log(pc.green('  ✓ Created app/layout.tsx'));
    }
  }

  if (!silent) {
    console.log(pc.green('\n✨ Tailwind CSS ready!\n'));
  }
}

/**
 * Check if Tailwind dependencies are installed
 */
export function checkTailwindDeps(rootDir: string): {
  hasPackageJson: boolean;
  hasTailwind: boolean;
  hasPostCSS: boolean;
  hasAutoprefixer: boolean;
} {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {
      hasPackageJson: false,
      hasTailwind: false,
      hasPostCSS: false,
      hasAutoprefixer: false,
    };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return {
    hasPackageJson: true,
    hasTailwind: !!allDeps['tailwindcss'],
    hasPostCSS: !!allDeps['postcss'],
    hasAutoprefixer: !!allDeps['autoprefixer'],
  };
}

/**
 * Get install command for missing Tailwind dependencies
 */
export function getTailwindInstallCommand(rootDir: string): string | null {
  const deps = checkTailwindDeps(rootDir);
  
  if (!deps.hasPackageJson) {
    return null;
  }

  const missing: string[] = [];
  if (!deps.hasTailwind) missing.push('tailwindcss');
  if (!deps.hasPostCSS) missing.push('postcss');
  if (!deps.hasAutoprefixer) missing.push('autoprefixer');

  if (missing.length === 0) {
    return null;
  }

  // Detect package manager
  const hasYarnLock = fs.existsSync(path.join(rootDir, 'yarn.lock'));
  const hasPnpmLock = fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'));
  const hasBunLock = fs.existsSync(path.join(rootDir, 'bun.lockb'));

  let pm = 'npm install -D';
  if (hasBunLock) pm = 'bun add -d';
  else if (hasPnpmLock) pm = 'pnpm add -D';
  else if (hasYarnLock) pm = 'yarn add -D';

  return `${pm} ${missing.join(' ')}`;
}
