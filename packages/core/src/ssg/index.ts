/**
 * Float.js - Static Site Generation (SSG) & Incremental Static Regeneration (ISR)
 * 
 * Built-in static generation with automatic revalidation.
 * Simpler API than Next.js with more flexibility.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface StaticPath {
  params: Record<string, string | string[]>;
  locale?: string;
}

export interface GetStaticPathsResult {
  paths: StaticPath[];
  fallback: boolean | 'blocking';
}

export interface GetStaticPropsContext<P = Record<string, string>> {
  params: P;
  locale?: string;
  defaultLocale?: string;
  preview?: boolean;
  previewData?: unknown;
}

export interface GetStaticPropsResult<T = unknown> {
  props: T;
  revalidate?: number | false;
  notFound?: boolean;
  redirect?: {
    destination: string;
    permanent?: boolean;
    statusCode?: 301 | 302 | 303 | 307 | 308;
  };
}

export interface CachedPage {
  html: string;
  props: unknown;
  generatedAt: number;
  revalidateAfter: number | null;
  etag: string;
  headers?: Record<string, string>;
}

export interface SSGConfig {
  /** Directory to store generated pages */
  outDir: string;
  /** Default revalidation time in seconds */
  defaultRevalidate: number;
  /** Enable stale-while-revalidate */
  staleWhileRevalidate: boolean;
  /** Max pages in memory cache */
  maxMemoryCacheSize: number;
  /** Custom render function */
  renderPage?: (component: unknown, props: unknown) => Promise<string>;
  /** Compression for stored pages */
  compression: boolean;
}

export interface GenerateResult {
  path: string;
  success: boolean;
  error?: Error;
  duration: number;
  size: number;
  revalidateAt?: Date;
}

export interface ISRState {
  revalidating: Set<string>;
  scheduled: Map<string, NodeJS.Timeout>;
  lastRevalidation: Map<string, number>;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: SSGConfig = {
  outDir: '.float/static',
  defaultRevalidate: 60,
  staleWhileRevalidate: true,
  maxMemoryCacheSize: 100,
  compression: false
};

// ============================================================================
// SSG ENGINE
// ============================================================================

export class SSGEngine {
  private config: SSGConfig;
  private memoryCache: Map<string, CachedPage> = new Map();
  private diskCachePath: string;
  private isrState: ISRState = {
    revalidating: new Set(),
    scheduled: new Map(),
    lastRevalidation: new Map()
  };

  constructor(config: Partial<SSGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.diskCachePath = join(process.cwd(), this.config.outDir);
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!existsSync(this.diskCachePath)) {
      mkdirSync(this.diskCachePath, { recursive: true });
    }
  }

  private getCacheKey(path: string, locale?: string): string {
    const normalized = path.replace(/^\/+|\/+$/g, '') || 'index';
    const key = locale ? `${locale}/${normalized}` : normalized;
    return key.replace(/\//g, '__');
  }

  private getEtag(content: string): string {
    return createHash('md5').update(content).digest('hex').slice(0, 16);
  }

  private getCacheFilePath(cacheKey: string): string {
    return join(this.diskCachePath, `${cacheKey}.json`);
  }

  /**
   * Generate static page and cache it
   */
  async generatePage<P = unknown>(
    path: string,
    getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>,
    render: (props: P) => Promise<string>,
    params: Record<string, string> = {},
    locale?: string
  ): Promise<GenerateResult> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(path, locale);

    try {
      // Get props
      const propsResult = await getStaticProps({
        params,
        locale,
        preview: false
      });

      // Handle redirect/notFound
      if (propsResult.redirect) {
        return {
          path,
          success: true,
          duration: Date.now() - startTime,
          size: 0
        };
      }

      if (propsResult.notFound) {
        return {
          path,
          success: false,
          duration: Date.now() - startTime,
          size: 0,
          error: new Error('Page not found')
        };
      }

      // Render HTML
      const html = await render(propsResult.props);
      const etag = this.getEtag(html);

      // Calculate revalidation
      const revalidate = propsResult.revalidate ?? this.config.defaultRevalidate;
      const revalidateAfter = revalidate === false 
        ? null 
        : Date.now() + (revalidate * 1000);

      // Create cached page
      const cachedPage: CachedPage = {
        html,
        props: propsResult.props,
        generatedAt: Date.now(),
        revalidateAfter,
        etag,
        headers: {
          'Cache-Control': revalidate === false
            ? 'public, max-age=31536000, immutable'
            : `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`
        }
      };

      // Store in memory cache (with LRU eviction)
      this.setMemoryCache(cacheKey, cachedPage);

      // Store on disk
      this.writeToDisk(cacheKey, cachedPage);

      return {
        path,
        success: true,
        duration: Date.now() - startTime,
        size: html.length,
        revalidateAt: revalidateAfter ? new Date(revalidateAfter) : undefined
      };

    } catch (error) {
      return {
        path,
        success: false,
        duration: Date.now() - startTime,
        size: 0,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Get cached page or generate on-demand
   */
  async getPage<P = unknown>(
    path: string,
    getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>,
    render: (props: P) => Promise<string>,
    params: Record<string, string> = {},
    locale?: string,
    fallback: boolean | 'blocking' = false
  ): Promise<{ cached: CachedPage; stale: boolean } | null> {
    const cacheKey = this.getCacheKey(path, locale);

    // Try memory cache first
    let cached = this.memoryCache.get(cacheKey);

    // Try disk cache if not in memory
    if (!cached) {
      cached = this.readFromDisk(cacheKey) || undefined;
      if (cached) {
        this.setMemoryCache(cacheKey, cached);
      }
    }

    // If we have a cached page
    if (cached) {
      const isStale = cached.revalidateAfter !== null && 
                      Date.now() > cached.revalidateAfter;

      // If stale and SWR enabled, trigger background revalidation
      if (isStale && this.config.staleWhileRevalidate) {
        this.triggerRevalidation(path, getStaticProps, render, params, locale);
      }

      return { cached, stale: isStale };
    }

    // No cached page - handle fallback
    if (fallback === false) {
      return null; // 404
    }

    // Generate on-demand (blocking or non-blocking)
    if (fallback === 'blocking') {
      const result = await this.generatePage(path, getStaticProps, render, params, locale);
      if (result.success) {
        const newCached = this.memoryCache.get(cacheKey);
        return newCached ? { cached: newCached, stale: false } : null;
      }
    }

    return null;
  }

  /**
   * Trigger ISR revalidation in background
   */
  private async triggerRevalidation<P = unknown>(
    path: string,
    getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>,
    render: (props: P) => Promise<string>,
    params: Record<string, string> = {},
    locale?: string
  ): Promise<void> {
    const cacheKey = this.getCacheKey(path, locale);

    // Prevent concurrent revalidation
    if (this.isrState.revalidating.has(cacheKey)) {
      return;
    }

    this.isrState.revalidating.add(cacheKey);

    try {
      await this.generatePage(path, getStaticProps, render, params, locale);
      this.isrState.lastRevalidation.set(cacheKey, Date.now());
    } finally {
      this.isrState.revalidating.delete(cacheKey);
    }
  }

  /**
   * Force revalidation of a path (On-Demand ISR)
   */
  async revalidate<P = unknown>(
    path: string,
    getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>,
    render: (props: P) => Promise<string>,
    params: Record<string, string> = {},
    locale?: string
  ): Promise<{ revalidated: boolean; error?: string }> {
    try {
      const result = await this.generatePage(path, getStaticProps, render, params, locale);
      return { revalidated: result.success, error: result.error?.message };
    } catch (error) {
      return { 
        revalidated: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Batch generate multiple pages
   */
  async generatePaths<P = unknown>(
    paths: StaticPath[],
    getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<P>>,
    render: (props: P) => Promise<string>,
    concurrency: number = 5
  ): Promise<GenerateResult[]> {
    const results: GenerateResult[] = [];
    const queue = [...paths];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        const pathStr = this.buildPath(item.params);
        const result = await this.generatePage(
          pathStr,
          getStaticProps,
          render,
          item.params as Record<string, string>,
          item.locale
        );
        results.push(result);
      }
    };

    // Run workers in parallel
    const workers = Array(Math.min(concurrency, paths.length))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);

    return results;
  }

  private buildPath(params: Record<string, string | string[]>): string {
    return '/' + Object.values(params)
      .map(v => Array.isArray(v) ? v.join('/') : v)
      .join('/');
  }

  /**
   * Memory cache with LRU eviction
   */
  private setMemoryCache(key: string, page: CachedPage): void {
    // Evict if at capacity
    if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    // Delete and re-add to maintain LRU order
    this.memoryCache.delete(key);
    this.memoryCache.set(key, page);
  }

  /**
   * Write cached page to disk
   */
  private writeToDisk(cacheKey: string, page: CachedPage): void {
    try {
      const filePath = this.getCacheFilePath(cacheKey);
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filePath, JSON.stringify(page));
    } catch {
      // Silently fail disk writes
    }
  }

  /**
   * Read cached page from disk
   */
  private readFromDisk(cacheKey: string): CachedPage | null {
    try {
      const filePath = this.getCacheFilePath(cacheKey);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch {
      // Silently fail disk reads
    }
    return null;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memoryCache.clear();
    
    // Clear scheduled revalidations
    for (const timeout of this.isrState.scheduled.values()) {
      clearTimeout(timeout);
    }
    this.isrState.scheduled.clear();
    this.isrState.lastRevalidation.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryPages: number;
    diskPages: number;
    revalidating: number;
    lastRevalidations: Record<string, Date>;
  } {
    let diskPages = 0;
    try {
      if (existsSync(this.diskCachePath)) {
        diskPages = readdirSync(this.diskCachePath)
          .filter(f => f.endsWith('.json')).length;
      }
    } catch {
      // Ignore
    }

    return {
      memoryPages: this.memoryCache.size,
      diskPages,
      revalidating: this.isrState.revalidating.size,
      lastRevalidations: Object.fromEntries(
        Array.from(this.isrState.lastRevalidation.entries())
          .map(([k, v]) => [k, new Date(v)])
      )
    };
  }

  /**
   * Purge stale pages from disk
   */
  purgeStale(): number {
    let purged = 0;

    try {
      if (!existsSync(this.diskCachePath)) return 0;

      const files = readdirSync(this.diskCachePath)
        .filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = join(this.diskCachePath, file);
        try {
          const content = readFileSync(filePath, 'utf-8');
          const page: CachedPage = JSON.parse(content);
          
          if (page.revalidateAfter !== null && Date.now() > page.revalidateAfter) {
            unlinkSync(filePath);
            purged++;
          }
        } catch {
          // Invalid file, remove it
          unlinkSync(filePath);
          purged++;
        }
      }
    } catch {
      // Ignore
    }

    return purged;
  }
}

// ============================================================================
// HELPER FUNCTIONS (like getStaticPaths, getStaticProps)
// ============================================================================

/**
 * Define static paths for dynamic routes
 */
export function defineStaticPaths<_P extends StaticPath = StaticPath>(
  fn: () => Promise<GetStaticPathsResult> | GetStaticPathsResult
): () => Promise<GetStaticPathsResult> {
  return async () => {
    const result = await fn();
    return result;
  };
}

/**
 * Define static props for a page
 */
export function defineStaticProps<P = unknown, Params = Record<string, string>>(
  fn: (ctx: GetStaticPropsContext<Params>) => Promise<GetStaticPropsResult<P>> | GetStaticPropsResult<P>
): (ctx: GetStaticPropsContext<Params>) => Promise<GetStaticPropsResult<P>> {
  return async (ctx) => {
    const result = await fn(ctx);
    return result;
  };
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

let ssgEngine: SSGEngine | null = null;

/**
 * Get or create SSG engine instance
 */
export function getSSGEngine(config?: Partial<SSGConfig>): SSGEngine {
  if (!ssgEngine) {
    ssgEngine = new SSGEngine(config);
  }
  return ssgEngine;
}

/**
 * Configure SSG engine
 */
export function configureSSG(config: Partial<SSGConfig>): SSGEngine {
  ssgEngine = new SSGEngine(config);
  return ssgEngine;
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

export interface SSGHandlerOptions {
  getStaticPaths?: () => Promise<GetStaticPathsResult>;
  getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult>;
  render: (props: unknown) => Promise<string>;
  fallback?: boolean | 'blocking';
}

/**
 * Create SSG request handler
 */
export function createSSGHandler(options: SSGHandlerOptions) {
  const engine = getSSGEngine();

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract params from path (simplified)
    const params: Record<string, string> = {};

    // Try to get cached page
    const result = await engine.getPage(
      path,
      options.getStaticProps as (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<unknown>>,
      options.render,
      params,
      undefined,
      options.fallback ?? false
    );

    if (!result) {
      return new Response('Not Found', { status: 404 });
    }

    // Check ETag for conditional request
    const ifNoneMatch = req.headers.get('If-None-Match');
    if (ifNoneMatch === result.cached.etag) {
      return new Response(null, { status: 304 });
    }

    // Return cached HTML
    return new Response(result.cached.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'ETag': result.cached.etag,
        'X-Float-Generated': new Date(result.cached.generatedAt).toISOString(),
        'X-Float-Stale': result.stale ? 'true' : 'false',
        ...result.cached.headers
      }
    });
  };
}

// ============================================================================
// REVALIDATION API
// ============================================================================

export interface RevalidateAPIOptions {
  secret?: string;
  getStaticProps: (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult>;
  render: (props: unknown) => Promise<string>;
}

/**
 * Create on-demand revalidation API handler
 */
export function createRevalidateHandler(options: RevalidateAPIOptions) {
  const engine = getSSGEngine();

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    
    // Validate secret if configured
    if (options.secret) {
      const providedSecret = url.searchParams.get('secret');
      if (providedSecret !== options.secret) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Get path to revalidate
    const pathToRevalidate = url.searchParams.get('path');
    if (!pathToRevalidate) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger revalidation
    const result = await engine.revalidate(
      pathToRevalidate,
      options.getStaticProps as (ctx: GetStaticPropsContext) => Promise<GetStaticPropsResult<unknown>>,
      options.render
    );

    return new Response(JSON.stringify(result), {
      status: result.revalidated ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const ssg = {
  engine: getSSGEngine,
  configure: configureSSG,
  defineStaticPaths,
  defineStaticProps,
  createHandler: createSSGHandler,
  createRevalidateHandler
};

export default ssg;
