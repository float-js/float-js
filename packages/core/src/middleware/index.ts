/**
 * Float.js Edge Middleware
 * Run code at the edge before requests hit your application
 * 
 * Inspired by Vercel Edge but works everywhere!
 */

import type { IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// TYPES
// ============================================================================

export interface MiddlewareRequest {
  /** HTTP method */
  method: string;
  /** Request URL */
  url: string;
  /** Parsed URL */
  nextUrl: NextURL;
  /** Request headers */
  headers: Headers;
  /** Cookies from request */
  cookies: RequestCookies;
  /** Geolocation data (if available) */
  geo?: GeoData;
  /** IP address */
  ip?: string;
  /** Original request */
  request: Request;
}

export interface NextURL {
  /** Full URL */
  href: string;
  /** Origin */
  origin: string;
  /** Protocol */
  protocol: string;
  /** Hostname */
  hostname: string;
  /** Port */
  port: string;
  /** Pathname */
  pathname: string;
  /** Search params */
  searchParams: URLSearchParams;
  /** Search string */
  search: string;
  /** Hash */
  hash: string;
  /** Base path */
  basePath: string;
  /** Locale */
  locale?: string;
  /** Clone the URL */
  clone(): NextURL;
}

export interface RequestCookies {
  get(name: string): { name: string; value: string } | undefined;
  getAll(): Array<{ name: string; value: string }>;
  has(name: string): boolean;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}

export interface CookieOptions {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface GeoData {
  city?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export type MiddlewareHandler = (
  request: MiddlewareRequest
) => Promise<MiddlewareResponse | void> | MiddlewareResponse | void;

export type MiddlewareResponse = Response | NextResponse;

export interface MiddlewareConfig {
  matcher?: string | string[];
}

// ============================================================================
// NEXT RESPONSE
// ============================================================================

export class NextResponse extends Response {
  private _cookies: Map<string, { value: string; options?: CookieOptions }> = new Map();
  private _headers: Headers;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this._headers = new Headers(init?.headers);
  }

  get cookies() {
    const self = this;
    return {
      set(name: string, value: string, options?: CookieOptions) {
        self._cookies.set(name, { value, options });
        self._headers.append('Set-Cookie', self._serializeCookie(name, value, options));
      },
      delete(name: string) {
        self._cookies.delete(name);
        self._headers.append('Set-Cookie', `${name}=; Max-Age=0; Path=/`);
      },
      get(name: string) {
        const cookie = self._cookies.get(name);
        return cookie ? { name, value: cookie.value } : undefined;
      },
      getAll() {
        return Array.from(self._cookies.entries()).map(([name, { value }]) => ({ name, value }));
      },
    };
  }

  private _serializeCookie(name: string, value: string, options?: CookieOptions): string {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    
    if (options?.domain) cookie += `; Domain=${options.domain}`;
    if (options?.path) cookie += `; Path=${options.path}`;
    if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options?.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options?.httpOnly) cookie += '; HttpOnly';
    if (options?.secure) cookie += '; Secure';
    if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
    
    return cookie;
  }

  /**
   * Continue to the next middleware/handler
   */
  static next(init?: { request?: { headers?: Headers } }): NextResponse {
    const response = new NextResponse(null, { status: 200 });
    
    if (init?.request?.headers) {
      init.request.headers.forEach((value, key) => {
        response._headers.set(`x-middleware-request-${key}`, value);
      });
    }
    
    // Mark as "continue"
    response._headers.set('x-middleware-next', '1');
    
    return response;
  }

  /**
   * Redirect to a URL
   */
  static redirect(url: string | URL, status: 301 | 302 | 303 | 307 | 308 = 307): NextResponse {
    const urlString = typeof url === 'string' ? url : url.toString();
    return new NextResponse(null, {
      status,
      headers: { Location: urlString },
    });
  }

  /**
   * Rewrite to a different URL (internal redirect)
   */
  static rewrite(url: string | URL): NextResponse {
    const urlString = typeof url === 'string' ? url : url.toString();
    const response = new NextResponse(null, { status: 200 });
    response._headers.set('x-middleware-rewrite', urlString);
    return response;
  }

  /**
   * Return a JSON response
   */
  static json(data: unknown, init?: ResponseInit): NextResponse {
    const body = JSON.stringify(data);
    return new NextResponse(body, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }
}

// ============================================================================
// MATCHER UTILITIES
// ============================================================================

/**
 * Convert matcher pattern to regex
 */
function matcherToRegex(pattern: string): RegExp {
  // Handle special patterns
  if (pattern === '*') return /.*/;
  if (pattern === '/') return /^\/$/;
  
  // Convert Next.js-style patterns to regex
  let regex = pattern
    // Escape special regex chars (except our patterns)
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // Convert :param to named capture groups
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '(?<$1>[^/]+)')
    // Convert * to match any characters
    .replace(/\\\*/g, '.*')
    // Handle (group) for optional segments
    .replace(/\\\(([^)]+)\\\)/g, '($1)?');
  
  return new RegExp(`^${regex}$`);
}

/**
 * Check if path matches any of the patterns
 */
function matchesPath(path: string, matcher?: string | string[]): boolean {
  if (!matcher) return true;
  
  const patterns = Array.isArray(matcher) ? matcher : [matcher];
  return patterns.some(pattern => matcherToRegex(pattern).test(path));
}

// ============================================================================
// REQUEST PARSING
// ============================================================================

function parseCookies(cookieHeader: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      cookies.set(name, valueParts.join('='));
    }
  });
  
  return cookies;
}

function createRequestCookies(cookieHeader: string): RequestCookies {
  const cookies = parseCookies(cookieHeader);
  const toSet: Map<string, { value: string; options?: CookieOptions }> = new Map();
  const toDelete: Set<string> = new Set();
  
  return {
    get(name: string) {
      if (toDelete.has(name)) return undefined;
      const value = toSet.get(name)?.value ?? cookies.get(name);
      return value ? { name, value } : undefined;
    },
    getAll() {
      const result: Array<{ name: string; value: string }> = [];
      
      cookies.forEach((value, name) => {
        if (!toDelete.has(name) && !toSet.has(name)) {
          result.push({ name, value });
        }
      });
      
      toSet.forEach(({ value }, name) => {
        result.push({ name, value });
      });
      
      return result;
    },
    has(name: string) {
      if (toDelete.has(name)) return false;
      return toSet.has(name) || cookies.has(name);
    },
    set(name: string, value: string, options?: CookieOptions) {
      toDelete.delete(name);
      toSet.set(name, { value, options });
    },
    delete(name: string) {
      toSet.delete(name);
      toDelete.add(name);
    },
  };
}

function createNextUrl(url: URL, basePath: string = ''): NextURL {
  return {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    searchParams: url.searchParams,
    search: url.search,
    hash: url.hash,
    basePath,
    locale: undefined,
    clone() {
      return createNextUrl(new URL(url.href), basePath);
    },
  };
}

// ============================================================================
// MIDDLEWARE RUNNER
// ============================================================================

export interface MiddlewareDefinition {
  handler: MiddlewareHandler;
  config?: MiddlewareConfig;
}

const middlewareStack: MiddlewareDefinition[] = [];

/**
 * Register a middleware
 */
export function registerMiddleware(
  handler: MiddlewareHandler,
  config?: MiddlewareConfig
): void {
  middlewareStack.push({ handler, config });
}

/**
 * Clear all middleware
 */
export function clearMiddleware(): void {
  middlewareStack.length = 0;
}

/**
 * Create middleware handler for server integration
 */
export function createMiddlewareHandler(
  middlewares?: MiddlewareDefinition[]
) {
  const stack = middlewares || middlewareStack;
  
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): Promise<void> => {
    const protocol = (req.socket as any).encrypted ? 'https' : 'http';
    const host = req.headers.host || 'localhost';
    const urlString = req.url || '/';
    const url = new URL(urlString, `${protocol}://${host}`);
    
    // Create middleware request
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    });
    
    const request = new Request(url.href, {
      method: req.method,
      headers,
    });
    
    const middlewareReq: MiddlewareRequest = {
      method: req.method || 'GET',
      url: urlString,
      nextUrl: createNextUrl(url),
      headers,
      cookies: createRequestCookies(req.headers.cookie || ''),
      ip: (req.socket.remoteAddress || '').replace('::ffff:', ''),
      request,
    };
    
    // Run middleware stack
    for (const { handler, config } of stack) {
      // Check if path matches
      if (!matchesPath(url.pathname, config?.matcher)) {
        continue;
      }
      
      try {
        const result = await handler(middlewareReq);
        
        if (!result) {
          continue; // No response, continue to next middleware
        }
        
        // Check for special headers
        const middlewareHeaders = result.headers;
        
        // Handle "next" (continue)
        if (middlewareHeaders.get('x-middleware-next')) {
          continue;
        }
        
        // Handle rewrite
        const rewriteUrl = middlewareHeaders.get('x-middleware-rewrite');
        if (rewriteUrl) {
          // Update request URL for downstream handlers
          (req as any).url = rewriteUrl;
          continue;
        }
        
        // Handle redirect
        if (result.status >= 300 && result.status < 400) {
          const location = middlewareHeaders.get('Location');
          if (location) {
            res.setHeader('Location', location);
            res.statusCode = result.status;
            res.end();
            return;
          }
        }
        
        // Handle response
        if (result.body || result.status !== 200) {
          res.statusCode = result.status;
          
          result.headers.forEach((value, key) => {
            if (!key.startsWith('x-middleware-')) {
              res.setHeader(key, value);
            }
          });
          
          if (result.body) {
            const body = await result.text();
            res.end(body);
          } else {
            res.end();
          }
          return;
        }
      } catch (error) {
        console.error('Middleware error:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
    }
    
    // No middleware blocked, continue
    next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const middleware = {
  register: registerMiddleware,
  clear: clearMiddleware,
  handler: createMiddlewareHandler,
  NextResponse,
};

/**
 * Shorthand for common middleware patterns
 */
export const middlewareHelpers = {
  /**
   * Basic auth middleware
   */
  basicAuth(username: string, password: string): MiddlewareHandler {
    return (req) => {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
      }
      
      const credentials = atob(authHeader.slice(6));
      const [user, pass] = credentials.split(':');
      
      if (user !== username || pass !== password) {
        return new NextResponse('Invalid credentials', { status: 401 });
      }
      
      return NextResponse.next();
    };
  },
  
  /**
   * CORS middleware
   */
  cors(options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {}): MiddlewareHandler {
    const {
      origin = '*',
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers = ['Content-Type', 'Authorization'],
      credentials = false,
    } = options;
    
    return (req) => {
      const response = NextResponse.next();
      
      const requestOrigin = req.headers.get('origin');
      const allowedOrigin = Array.isArray(origin)
        ? (origin.includes(requestOrigin || '') ? requestOrigin : origin[0])
        : origin;
      
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin || '*');
      response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
      
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 204,
          headers: response.headers,
        });
      }
      
      return response;
    };
  },
  
  /**
   * Rate limiting middleware
   */
  rateLimit(options: {
    limit: number;
    window: number; // seconds
  }): MiddlewareHandler {
    const { limit, window } = options;
    const requests = new Map<string, { count: number; resetAt: number }>();
    
    return (req) => {
      const ip = req.ip || 'unknown';
      const now = Date.now();
      
      let record = requests.get(ip);
      
      if (!record || record.resetAt < now) {
        record = { count: 0, resetAt: now + window * 1000 };
        requests.set(ip, record);
      }
      
      record.count++;
      
      if (record.count > limit) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
            },
          }
        );
      }
      
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', String(limit));
      response.headers.set('X-RateLimit-Remaining', String(limit - record.count));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)));
      
      return response;
    };
  },
  
  /**
   * Redirect trailing slashes
   */
  trailingSlash(add: boolean = false): MiddlewareHandler {
    return (req) => {
      const path = req.nextUrl.pathname;
      
      if (path === '/') return NextResponse.next();
      
      const hasSlash = path.endsWith('/');
      
      if (add && !hasSlash) {
        return NextResponse.redirect(new URL(path + '/', req.request.url));
      }
      
      if (!add && hasSlash) {
        return NextResponse.redirect(new URL(path.slice(0, -1), req.request.url));
      }
      
      return NextResponse.next();
    };
  },
};
