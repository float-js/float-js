/**
 * Float.js - Built-in Analytics
 * 
 * Zero-config privacy-focused analytics built into the framework.
 * No external dependencies, no cookies, GDPR-compliant by default.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PageView {
  id: string;
  timestamp: number;
  pathname: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  sessionId: string;
  duration?: number;
}

export interface WebVitals {
  id: string;
  timestamp: number;
  pathname: string;
  metrics: {
    FCP?: number;  // First Contentful Paint
    LCP?: number;  // Largest Contentful Paint
    FID?: number;  // First Input Delay
    CLS?: number;  // Cumulative Layout Shift
    TTFB?: number; // Time to First Byte
    INP?: number;  // Interaction to Next Paint
  };
}

export interface CustomEvent {
  id: string;
  timestamp: number;
  name: string;
  pathname: string;
  properties?: Record<string, string | number | boolean>;
  sessionId: string;
}

export interface AnalyticsData {
  pageviews: PageView[];
  vitals: WebVitals[];
  events: CustomEvent[];
}

export interface AnalyticsConfig {
  /** Enable/disable analytics */
  enabled: boolean;
  /** Ignore paths (regex patterns) */
  ignorePaths: (string | RegExp)[];
  /** Max events in memory before flush */
  maxBufferSize: number;
  /** Flush interval in ms */
  flushInterval: number;
  /** Custom event handler */
  onFlush?: (data: AnalyticsData) => Promise<void>;
  /** Hash IP addresses for privacy */
  hashIPs: boolean;
  /** Track web vitals */
  trackVitals: boolean;
  /** Session timeout in minutes */
  sessionTimeout: number;
  /** GeoIP lookup */
  geoIP: boolean;
}

export interface AnalyticsSummary {
  period: { start: Date; end: Date };
  pageviews: {
    total: number;
    unique: number;
    byPath: Record<string, number>;
    byReferrer: Record<string, number>;
    byDevice: Record<string, number>;
    byBrowser: Record<string, number>;
    byCountry: Record<string, number>;
  };
  vitals: {
    avgFCP: number;
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    avgTTFB: number;
    p75LCP: number;
    p75FID: number;
    p75CLS: number;
  };
  events: {
    total: number;
    byName: Record<string, number>;
  };
  sessions: {
    total: number;
    avgDuration: number;
    bounceRate: number;
  };
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  ignorePaths: [/^\/__float/, /^\/api\//, /\.(ico|png|jpg|css|js)$/],
  maxBufferSize: 100,
  flushInterval: 30000, // 30 seconds
  hashIPs: true,
  trackVitals: true,
  sessionTimeout: 30, // minutes
  geoIP: false
};

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function parseUserAgent(ua?: string): { device: PageView['device']; browser: string; os: string } {
  if (!ua) {
    return { device: 'unknown', browser: 'Unknown', os: 'Unknown' };
  }

  // Device detection
  let device: PageView['device'] = 'desktop';
  if (/Mobile|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    device = 'tablet';
  }

  // Browser detection
  let browser = 'Unknown';
  if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // OS detection
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// ============================================================================
// ANALYTICS ENGINE
// ============================================================================

export class AnalyticsEngine {
  private config: AnalyticsConfig;
  private buffer: AnalyticsData = {
    pageviews: [],
    vitals: [],
    events: []
  };
  private flushTimer: NodeJS.Timeout | null = null;
  private sessions: Map<string, { lastActivity: number; views: number }> = new Map();
  private allData: AnalyticsData = {
    pageviews: [],
    vitals: [],
    events: []
  };

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private shouldIgnore(pathname: string): boolean {
    return this.config.ignorePaths.some(pattern => {
      if (typeof pattern === 'string') {
        return pathname.startsWith(pattern);
      }
      return pattern.test(pathname);
    });
  }

  private getOrCreateSession(ip: string): string {
    const sessionKey = this.config.hashIPs ? hashString(ip) : ip;
    const existing = this.sessions.get(sessionKey);
    const now = Date.now();
    const timeout = this.config.sessionTimeout * 60 * 1000;

    if (existing && (now - existing.lastActivity) < timeout) {
      existing.lastActivity = now;
      existing.views++;
      return sessionKey;
    }

    this.sessions.set(sessionKey, { lastActivity: now, views: 1 });
    return sessionKey;
  }

  /**
   * Track a page view
   */
  trackPageview(req: Request, options: { country?: string } = {}): PageView | null {
    if (!this.config.enabled) return null;

    const url = new URL(req.url);
    
    if (this.shouldIgnore(url.pathname)) return null;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;
    const { device, browser, os } = parseUserAgent(userAgent);
    const sessionId = this.getOrCreateSession(ip);

    const pageview: PageView = {
      id: generateId(),
      timestamp: Date.now(),
      pathname: url.pathname,
      referrer: req.headers.get('referer') || undefined,
      userAgent: userAgent?.substring(0, 200), // Truncate for storage
      country: options.country,
      device,
      browser,
      os,
      sessionId
    };

    this.buffer.pageviews.push(pageview);
    this.checkBufferSize();

    return pageview;
  }

  /**
   * Track Web Vitals
   */
  trackVitals(pathname: string, metrics: WebVitals['metrics']): WebVitals | null {
    if (!this.config.enabled || !this.config.trackVitals) return null;

    const vitals: WebVitals = {
      id: generateId(),
      timestamp: Date.now(),
      pathname,
      metrics
    };

    this.buffer.vitals.push(vitals);
    this.checkBufferSize();

    return vitals;
  }

  /**
   * Track custom event
   */
  trackEvent(
    name: string, 
    properties?: Record<string, string | number | boolean>,
    req?: Request
  ): CustomEvent | null {
    if (!this.config.enabled) return null;

    let pathname = '/';
    let sessionId = generateId();

    if (req) {
      const url = new URL(req.url);
      pathname = url.pathname;
      
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
      sessionId = this.getOrCreateSession(ip);
    }

    const event: CustomEvent = {
      id: generateId(),
      timestamp: Date.now(),
      name,
      pathname,
      properties,
      sessionId
    };

    this.buffer.events.push(event);
    this.checkBufferSize();

    return event;
  }

  private checkBufferSize(): void {
    const totalSize = this.buffer.pageviews.length + 
                      this.buffer.vitals.length + 
                      this.buffer.events.length;
    
    if (totalSize >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Flush buffer to storage/handler
   */
  async flush(): Promise<void> {
    if (this.buffer.pageviews.length === 0 && 
        this.buffer.vitals.length === 0 && 
        this.buffer.events.length === 0) {
      return;
    }

    const dataToFlush = { ...this.buffer };
    
    // Reset buffer
    this.buffer = { pageviews: [], vitals: [], events: [] };

    // Add to all data for summary
    this.allData.pageviews.push(...dataToFlush.pageviews);
    this.allData.vitals.push(...dataToFlush.vitals);
    this.allData.events.push(...dataToFlush.events);

    // Limit stored data (keep last 10000 of each)
    if (this.allData.pageviews.length > 10000) {
      this.allData.pageviews = this.allData.pageviews.slice(-10000);
    }
    if (this.allData.vitals.length > 10000) {
      this.allData.vitals = this.allData.vitals.slice(-10000);
    }
    if (this.allData.events.length > 10000) {
      this.allData.events = this.allData.events.slice(-10000);
    }

    // Call custom handler if provided
    if (this.config.onFlush) {
      await this.config.onFlush(dataToFlush);
    }
  }

  /**
   * Get analytics summary
   */
  getSummary(startDate?: Date, endDate?: Date): AnalyticsSummary {
    const start = startDate?.getTime() || Date.now() - (7 * 24 * 60 * 60 * 1000); // Last 7 days
    const end = endDate?.getTime() || Date.now();

    // Filter by date range
    const pageviews = this.allData.pageviews.filter(
      pv => pv.timestamp >= start && pv.timestamp <= end
    );
    const vitals = this.allData.vitals.filter(
      v => v.timestamp >= start && v.timestamp <= end
    );
    const events = this.allData.events.filter(
      e => e.timestamp >= start && e.timestamp <= end
    );

    // Calculate pageview stats
    const uniqueSessions = new Set(pageviews.map(pv => pv.sessionId));
    const byPath: Record<string, number> = {};
    const byReferrer: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byBrowser: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    for (const pv of pageviews) {
      byPath[pv.pathname] = (byPath[pv.pathname] || 0) + 1;
      if (pv.referrer) {
        try {
          const ref = new URL(pv.referrer).hostname;
          byReferrer[ref] = (byReferrer[ref] || 0) + 1;
        } catch {
          byReferrer['direct'] = (byReferrer['direct'] || 0) + 1;
        }
      } else {
        byReferrer['direct'] = (byReferrer['direct'] || 0) + 1;
      }
      byDevice[pv.device] = (byDevice[pv.device] || 0) + 1;
      byBrowser[pv.browser] = (byBrowser[pv.browser] || 0) + 1;
      if (pv.country) {
        byCountry[pv.country] = (byCountry[pv.country] || 0) + 1;
      }
    }

    // Calculate vitals averages
    const fcpValues = vitals.filter(v => v.metrics.FCP).map(v => v.metrics.FCP!);
    const lcpValues = vitals.filter(v => v.metrics.LCP).map(v => v.metrics.LCP!);
    const fidValues = vitals.filter(v => v.metrics.FID).map(v => v.metrics.FID!);
    const clsValues = vitals.filter(v => v.metrics.CLS).map(v => v.metrics.CLS!);
    const ttfbValues = vitals.filter(v => v.metrics.TTFB).map(v => v.metrics.TTFB!);

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    // Calculate session stats
    const sessionViews = new Map<string, number>();
    for (const pv of pageviews) {
      sessionViews.set(pv.sessionId, (sessionViews.get(pv.sessionId) || 0) + 1);
    }
    const bounces = Array.from(sessionViews.values()).filter(v => v === 1).length;
    const bounceRate = sessionViews.size > 0 ? (bounces / sessionViews.size) * 100 : 0;

    // Calculate event stats
    const byEventName: Record<string, number> = {};
    for (const e of events) {
      byEventName[e.name] = (byEventName[e.name] || 0) + 1;
    }

    return {
      period: { start: new Date(start), end: new Date(end) },
      pageviews: {
        total: pageviews.length,
        unique: uniqueSessions.size,
        byPath,
        byReferrer,
        byDevice,
        byBrowser,
        byCountry
      },
      vitals: {
        avgFCP: Math.round(avg(fcpValues)),
        avgLCP: Math.round(avg(lcpValues)),
        avgFID: Math.round(avg(fidValues)),
        avgCLS: Number(avg(clsValues).toFixed(3)),
        avgTTFB: Math.round(avg(ttfbValues)),
        p75LCP: Math.round(percentile(lcpValues, 75)),
        p75FID: Math.round(percentile(fidValues, 75)),
        p75CLS: Number(percentile(clsValues, 75).toFixed(3))
      },
      events: {
        total: events.length,
        byName: byEventName
      },
      sessions: {
        total: uniqueSessions.size,
        avgDuration: 0, // Would need page durations
        bounceRate: Number(bounceRate.toFixed(1))
      }
    };
  }

  /**
   * Get real-time stats (last 5 minutes)
   */
  getRealtime(): {
    activeUsers: number;
    pageviews: number;
    topPages: Array<{ path: string; count: number }>;
  } {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    const recentPageviews = this.allData.pageviews.filter(
      pv => pv.timestamp >= fiveMinutesAgo
    );

    const activeSessions = new Set(recentPageviews.map(pv => pv.sessionId));
    
    const pathCounts: Record<string, number> = {};
    for (const pv of recentPageviews) {
      pathCounts[pv.pathname] = (pathCounts[pv.pathname] || 0) + 1;
    }

    const topPages = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      activeUsers: activeSessions.size,
      pageviews: recentPageviews.length,
      topPages
    };
  }

  /**
   * Export data as JSON
   */
  exportData(): AnalyticsData {
    return { ...this.allData };
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.buffer = { pageviews: [], vitals: [], events: [] };
    this.allData = { pageviews: [], vitals: [], events: [] };
    this.sessions.clear();
  }

  /**
   * Stop the analytics engine
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export interface AnalyticsMiddlewareOptions {
  config?: Partial<AnalyticsConfig>;
  getCountry?: (req: Request) => string | undefined;
}

let analyticsEngine: AnalyticsEngine | null = null;

/**
 * Get or create analytics engine
 */
export function getAnalytics(config?: Partial<AnalyticsConfig>): AnalyticsEngine {
  if (!analyticsEngine) {
    analyticsEngine = new AnalyticsEngine(config);
  }
  return analyticsEngine;
}

/**
 * Configure analytics
 */
export function configureAnalytics(config: Partial<AnalyticsConfig>): AnalyticsEngine {
  analyticsEngine = new AnalyticsEngine(config);
  return analyticsEngine;
}

/**
 * Create analytics middleware
 */
export function createAnalyticsMiddleware(options: AnalyticsMiddlewareOptions = {}) {
  const engine = getAnalytics(options.config);

  return async (req: Request, next: () => Promise<Response>): Promise<Response> => {
    // Track pageview
    engine.trackPageview(req, {
      country: options.getCountry?.(req)
    });

    // Continue to next handler
    const response = await next();

    return response;
  };
}

/**
 * Create analytics API handler
 */
export function createAnalyticsHandler() {
  const engine = getAnalytics();

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'summary';

    switch (action) {
      case 'summary': {
        const startParam = url.searchParams.get('start');
        const endParam = url.searchParams.get('end');
        const summary = engine.getSummary(
          startParam ? new Date(startParam) : undefined,
          endParam ? new Date(endParam) : undefined
        );
        return new Response(JSON.stringify(summary), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'realtime': {
        const realtime = engine.getRealtime();
        return new Response(JSON.stringify(realtime), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'vitals': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        try {
          const body = await req.json() as { pathname: string; metrics: WebVitals['metrics'] };
          engine.trackVitals(body.pathname, body.metrics);
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch {
          return new Response('Invalid body', { status: 400 });
        }
      }

      case 'event': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        try {
          const body = await req.json() as { 
            name: string; 
            properties?: Record<string, string | number | boolean> 
          };
          engine.trackEvent(body.name, body.properties, req);
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch {
          return new Response('Invalid body', { status: 400 });
        }
      }

      case 'export': {
        const data = engine.exportData();
        return new Response(JSON.stringify(data), {
          headers: { 
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="analytics-export.json"'
          }
        });
      }

      default:
        return new Response('Unknown action', { status: 400 });
    }
  };
}

// ============================================================================
// CLIENT-SIDE SCRIPT (for Web Vitals)
// ============================================================================

export const analyticsClientScript = `
<script>
(function() {
  // Simple Web Vitals reporter
  const endpoint = '/__float/analytics?action=vitals';
  
  function sendVitals(metrics) {
    const body = JSON.stringify({
      pathname: window.location.pathname,
      metrics: metrics
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, { method: 'POST', body, keepalive: true });
    }
  }

  // Observe LCP
  if ('PerformanceObserver' in window) {
    const vitals = {};
    
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = Math.round(lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    
    // FCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.FCP = Math.round(entries[0].startTime);
    }).observe({ type: 'paint', buffered: true });
    
    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      vitals.CLS = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
    
    // Send on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendVitals(vitals);
      }
    });
  }
})();
</script>
`;

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const analytics = {
  engine: getAnalytics,
  configure: configureAnalytics,
  createMiddleware: createAnalyticsMiddleware,
  createHandler: createAnalyticsHandler,
  clientScript: analyticsClientScript,
  track: {
    pageview: (req: Request, options?: { country?: string }) => 
      getAnalytics().trackPageview(req, options),
    event: (name: string, properties?: Record<string, string | number | boolean>, req?: Request) => 
      getAnalytics().trackEvent(name, properties, req),
    vitals: (pathname: string, metrics: WebVitals['metrics']) => 
      getAnalytics().trackVitals(pathname, metrics)
  }
};

export default analytics;
