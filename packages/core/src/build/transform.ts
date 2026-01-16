/**
 * Float.js Transform
 * On-the-fly TypeScript/JSX transformation
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCache } from './persistent-cache.js';

// Module cache for dev mode
const moduleCache = new Map<string, { module: any; mtime: number }>();

/**
 * Transform and import a file
 * Handles .ts, .tsx, .js, .jsx files
 */
export async function transformFile(filePath: string, useCache: boolean = true): Promise<any> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  
  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const stats = fs.statSync(absolutePath);
  const mtime = stats.mtimeMs;

  // Check in-memory cache
  const cached = moduleCache.get(absolutePath);
  if (cached && cached.mtime === mtime) {
    return cached.module;
  }

  // Check persistent cache if enabled
  if (useCache) {
    const cache = getCache();
    const source = fs.readFileSync(absolutePath, 'utf-8');
    const sourceHash = require('crypto').createHash('sha256').update(source).digest('hex').slice(0, 16);
    const cacheKey = `transform_${absolutePath}_${sourceHash}`;
    
    if (cache.has(cacheKey)) {
      const cachedCode = cache.get<string>(cacheKey);
      if (cachedCode) {
        // Create temp file and import
        const tempDir = path.join(process.cwd(), '.float', '.cache');
        fs.mkdirSync(tempDir, { recursive: true });
        const tempFile = path.join(tempDir, `${path.basename(absolutePath, path.extname(absolutePath))}_${Date.now()}.mjs`);
        fs.writeFileSync(tempFile, cachedCode);
        
        try {
          const module = await import(pathToFileURL(tempFile).href);
          moduleCache.set(absolutePath, { module, mtime });
          setImmediate(() => { try { fs.unlinkSync(tempFile); } catch {} });
          return module;
        } catch (error) {
          // Cache invalid, continue with transformation
          setImmediate(() => { try { fs.unlinkSync(tempFile); } catch {} });
        }
      }
    }
  }

  // Read source
  const source = fs.readFileSync(absolutePath, 'utf-8');
  const ext = path.extname(absolutePath);

  // Determine loader
  const loader = getLoader(ext);

  // Transform with esbuild
  const result = await esbuild.transform(source, {
    loader,
    jsx: 'automatic',
    format: 'esm',
    target: 'node18',
    sourcemap: 'inline',
    sourcefile: absolutePath,
  });

  // Create temporary file for import
  const tempDir = path.join(process.cwd(), '.float', '.cache');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const tempFile = path.join(tempDir, `${path.basename(absolutePath, ext)}_${Date.now()}.mjs`);
  
  // Rewrite imports to absolute paths
  let code = result.code;
  code = rewriteImports(code, path.dirname(absolutePath));
  
  fs.writeFileSync(tempFile, code);

  try {
    // Dynamic import
    const module = await import(pathToFileURL(tempFile).href);
    
    // Cache the result
    moduleCache.set(absolutePath, { module, mtime });
    
    // Save to persistent cache if enabled
    if (useCache) {
      const cache = getCache();
      const sourceHash = require('crypto').createHash('sha256').update(source).digest('hex').slice(0, 16);
      const cacheKey = `transform_${absolutePath}_${sourceHash}`;
      cache.set(cacheKey, code, source);
    }
    
    // Clean up temp file (async)
    setImmediate(() => {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    });

    return module;
  } catch (error) {
    // Clean up on error
    try {
      fs.unlinkSync(tempFile);
    } catch {}
    throw error;
  }
}

/**
 * Get esbuild loader for file extension
 */
function getLoader(ext: string): esbuild.Loader {
  switch (ext) {
    case '.ts': return 'ts';
    case '.tsx': return 'tsx';
    case '.jsx': return 'jsx';
    case '.js': return 'js';
    case '.mjs': return 'js';
    case '.json': return 'json';
    case '.css': return 'css';
    default: return 'ts';
  }
}

/**
 * Rewrite relative imports to absolute paths
 */
function rewriteImports(code: string, baseDir: string): string {
  // Match import statements
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  
  return code.replace(importRegex, (match, importPath) => {
    // Resolve relative path
    let resolvedPath = path.resolve(baseDir, importPath);
    
    // Try to find the file with various extensions
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', ''];
    let found = false;
    
    for (const ext of extensions) {
      const tryPath = resolvedPath + ext;
      if (fs.existsSync(tryPath)) {
        resolvedPath = tryPath;
        found = true;
        break;
      }
      // Try index file
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        resolvedPath = indexPath;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Keep original for node_modules imports
      return match;
    }
    
    return `from '${pathToFileURL(resolvedPath).href}'`;
  });
}

/**
 * Clear module cache (for HMR)
 */
export function clearModuleCache(filePath?: string) {
  if (filePath) {
    moduleCache.delete(path.resolve(filePath));
  } else {
    moduleCache.clear();
  }
}

/**
 * Transform source code without file operations
 */
export async function transformSource(
  source: string,
  options: { filename?: string; loader?: esbuild.Loader } = {}
): Promise<string> {
  const { filename = 'module.tsx', loader = 'tsx' } = options;

  const result = await esbuild.transform(source, {
    loader,
    jsx: 'automatic',
    format: 'esm',
    target: 'node18',
    sourcemap: 'inline',
    sourcefile: filename,
  });

  return result.code;
}
