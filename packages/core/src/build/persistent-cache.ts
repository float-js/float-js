/**
 * Float.js Persistent Cache
 * File-based caching system for faster builds
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  hash: string;
}

export interface CacheManifest {
  version: string;
  entries: Record<string, {
    hash: string;
    timestamp: number;
    size: number;
  }>;
}

export class PersistentCache {
  private cacheDir: string;
  private manifestPath: string;
  private manifest: CacheManifest;

  constructor(rootDir: string = process.cwd()) {
    this.cacheDir = path.join(rootDir, '.float', 'cache');
    this.manifestPath = path.join(this.cacheDir, 'manifest.json');
    
    // Ensure cache directory exists
    fs.mkdirSync(this.cacheDir, { recursive: true });
    
    // Load or create manifest
    this.manifest = this.loadManifest();
  }

  private loadManifest(): CacheManifest {
    if (fs.existsSync(this.manifestPath)) {
      try {
        const data = fs.readFileSync(this.manifestPath, 'utf-8');
        return JSON.parse(data);
      } catch {
        // Invalid manifest, start fresh
      }
    }
    
    return {
      version: '1.0',
      entries: {},
    };
  }

  private saveManifest() {
    fs.writeFileSync(
      this.manifestPath,
      JSON.stringify(this.manifest, null, 2)
    );
  }

  /**
   * Generate hash for content
   */
  private hash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * Get cache key path
   */
  private getKeyPath(key: string): string {
    const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
    return path.join(this.cacheDir, `${safeKey}.cache`);
  }

  /**
   * Check if cache entry is valid
   */
  has(key: string, contentHash?: string): boolean {
    const entry = this.manifest.entries[key];
    if (!entry) return false;

    const cachePath = this.getKeyPath(key);
    if (!fs.existsSync(cachePath)) {
      // Cache file missing, clean up manifest
      delete this.manifest.entries[key];
      this.saveManifest();
      return false;
    }

    // If hash provided, verify it matches
    if (contentHash && entry.hash !== contentHash) {
      return false;
    }

    return true;
  }

  /**
   * Get cached value
   */
  get<T = any>(key: string): T | null {
    if (!this.has(key)) return null;

    try {
      const cachePath = this.getKeyPath(key);
      const data = fs.readFileSync(cachePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(data);
      return entry.value;
    } catch {
      return null;
    }
  }

  /**
   * Set cache value
   */
  set<T = any>(key: string, value: T, content?: string): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      hash: content ? this.hash(content) : this.hash(JSON.stringify(value)),
    };

    const cachePath = this.getKeyPath(key);
    const data = JSON.stringify(entry);
    
    fs.writeFileSync(cachePath, data);

    // Update manifest
    this.manifest.entries[key] = {
      hash: entry.hash,
      timestamp: entry.timestamp,
      size: Buffer.byteLength(data),
    };
    this.saveManifest();
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const cachePath = this.getKeyPath(key);
    
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }

    if (this.manifest.entries[key]) {
      delete this.manifest.entries[key];
      this.saveManifest();
      return true;
    }

    return false;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true });
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    this.manifest = {
      version: '1.0',
      entries: {},
    };
    this.saveManifest();
  }

  /**
   * Get cache statistics
   */
  stats(): {
    entries: number;
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Object.values(this.manifest.entries);
    const size = entries.reduce((acc, e) => acc + e.size, 0);
    const timestamps = entries.map(e => e.timestamp);

    return {
      entries: entries.length,
      size,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  /**
   * Clean old entries (older than maxAge milliseconds)
   */
  prune(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of Object.entries(this.manifest.entries)) {
      if (now - entry.timestamp > maxAge) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Global cache instance
let globalCache: PersistentCache | null = null;

/**
 * Get global cache instance
 */
export function getCache(rootDir?: string): PersistentCache {
  if (!globalCache) {
    globalCache = new PersistentCache(rootDir);
  }
  return globalCache;
}
