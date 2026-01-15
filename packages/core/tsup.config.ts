import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library entries (no shebang)
  {
    entry: {
      'index': 'src/index.ts',
      'server/index': 'src/server/index.ts',
      'router/index': 'src/router/index.ts',
      'ai/index': 'src/ai/index.ts',
      'api/index': 'src/api/index.ts',
      'realtime/index': 'src/realtime/index.ts',
      'devtools/index': 'src/devtools/index.ts',
      'image/index': 'src/image/index.ts',
      'middleware/index': 'src/middleware/index.ts',
      'ssg/index': 'src/ssg/index.ts',
      'analytics/index': 'src/analytics/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    target: 'node18',
    shims: true,
    external: ['ws', 'postcss', 'tailwindcss', 'autoprefixer'],
  },
  // CLI entry (with shebang)
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean, other build already did
    target: 'node18',
    shims: true,
    external: ['postcss', 'tailwindcss', 'autoprefixer'],
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
