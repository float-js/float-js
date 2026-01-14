<p align="center">
  <a href="https://floatjs.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/float-js/float-js/main/.github/logo-dark.svg">
      <img src="https://raw.githubusercontent.com/float-js/float-js/main/.github/logo-light.svg" height="128">
    </picture>
    <h1 align="center">Float.js</h1>
  </a>
</p>

<p align="center">
  <strong>The React Framework for the AI Era</strong>
</p>

<p align="center">
  Build blazingly fast web applications with intelligent SSR streaming, file-based routing,<br>
  50ms hot reload, zero-config TypeScript, and AI-ready architecture.
</p>

<p align="center">
  <a href="https://github.com/float-js/float-js/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <a href="https://github.com/float-js/float-js/stargazers"><img src="https://img.shields.io/github/stars/float-js/float-js?style=flat-square&color=8b5cf6" alt="stars"></a>
  <a href="https://github.com/float-js/float-js"><img src="https://img.shields.io/badge/PRs-welcome-8b5cf6?style=flat-square" alt="PRs welcome"></a>
  <a href="https://github.com/float-js/float-js"><img src="https://img.shields.io/badge/version-0.1.0-8b5cf6?style=flat-square" alt="version"></a>
</p>

<p align="center">
  <a href="https://floatjs.dev/docs">Documentation</a> •
  <a href="https://floatjs.dev/learn">Learn</a> •
  <a href="https://floatjs.dev/examples">Examples</a> •
  <a href="https://floatjs.dev/blog">Blog</a>
</p>

---

## ⚡ Quick Start

Get started with Float.js in seconds:

```bash
npx create-float@latest my-app
cd my-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🚀 Why Float.js?

Float.js is built from the ground up for the modern web. It combines the best developer experience with cutting-edge performance.

| Feature | Float.js | Next.js | Remix |
|---------|----------|---------|-------|
| Hot Reload | **~50ms** | ~500ms | ~300ms |
| Build Time | **~100ms** | ~3s | ~2s |
| Native AI Integration | ✅ Built-in | ❌ Plugin | ❌ Plugin |
| Type-Safe APIs | ✅ Built-in | ❌ Manual | ❌ Manual |
| Real-time WebSocket | ✅ Built-in | ❌ Plugin | ❌ Plugin |
| Dev Dashboard | ✅ Built-in | ❌ None | ❌ None |
| Edge Middleware | ✅ Built-in | ✅ | ❌ |
| Image Optimization | ✅ Built-in | ✅ | ❌ Plugin |
| **SSG + ISR** | ✅ Built-in | ✅ | ❌ |
| **Built-in Analytics** | ✅ Built-in | ❌ None | ❌ None |
| SSR Streaming | ✅ Native | ✅ | ✅ |
| Zero Config | ✅ | ❌ | ❌ |

## ✨ Features

### 🔥 Instant Development

```typescript
// That's it. No config needed.
// Edit your code, see changes in ~50ms.
```

- **Lightning-fast HMR** powered by esbuild
- **State preservation** across refreshes
- **Error overlay** with stack traces

### 📁 File-Based Routing

```
app/
├── page.tsx           → /
├── about/page.tsx     → /about
├── blog/[slug]/page.tsx → /blog/:slug
├── api/users/route.ts → /api/users
└── layout.tsx         → Shared layout
```

- Automatic route generation
- Dynamic segments `[param]`
- Catch-all routes `[...slug]`
- API routes with `route.ts`
- Nested layouts

### 🤖 Native AI Integration (No Plugins!)

```tsx
import { ai, streamResponse } from '@float/core';

// Simple chat
const response = await ai.chat("Explain quantum computing");

// Streaming in API routes
export async function POST(req: Request) {
  const { prompt } = await req.json();
  return streamResponse(ai.stream(prompt));
}
```

- Built-in OpenAI & Anthropic support
- Streaming responses out of the box
- Server-Sent Events (SSE)
- Zero configuration needed

### 🎯 Type-Safe APIs (No Zod Required!)

```tsx
import { typedRoute, f, json } from '@float/core';

export const POST = typedRoute({
  body: f.object({
    name: f.string().min(2),
    email: f.string().email(),
    age: f.number().min(18).optional(),
  }),
}, async (req) => {
  const { name, email } = req.validated.body; // Fully typed!
  return json({ message: `Hello ${name}!` });
});
```

- Built-in schema validation
- Automatic error responses
- Full TypeScript inference
- Zero dependencies

### 🔌 Real-time Built-in (No Socket.io Required!)

```tsx
import { realtime } from '@float/core';

// Server
const server = realtime.create();
server.onConnection((client) => {
  console.log(`${client.id} connected`);
});
server.onEvent('chat', (msg, client) => {
  server.broadcastToRoom('lobby', msg);
});
await server.start();

// Client (browser)
const client = realtime.client({ url: 'ws://localhost:3001/ws' });
await client.connect();
client.join('lobby');
client.emit('chat', { message: 'Hello!' });
```

- Native WebSocket support
- Rooms & broadcasting
- Presence tracking
- Auto-reconnection

### 📊 Dev Dashboard (Next.js Doesn't Have This!)

```tsx
import { devtools } from '@float/core';

// Access at http://localhost:3000/__float
// Features:
// - Real-time request logs
// - Route visualization
// - Performance metrics
// - Build history
// - Memory usage
```

- Visual development dashboard
- Request/response logging
- Performance monitoring
- Route inspector

### 🛡️ Edge Middleware

```tsx
import { NextResponse, middlewareHelpers } from '@float/core';

// Rate limiting
export const middleware = middlewareHelpers.rateLimit({ 
  limit: 100, 
  window: 60 
});

// Or custom logic
export function middleware(req) {
  if (!req.cookies.has('auth')) {
    return NextResponse.redirect('/login');
  }
  return NextResponse.next();
}
```

- Request/response interception
- Built-in helpers (CORS, rate limiting, auth)
- URL rewriting
- Cookie management

### 🖼️ Image Optimization

```tsx
import { image } from '@float/core';

// Configure
image.configure({
  domains: ['cdn.example.com'],
  quality: 80,
});

// Use in templates
const imgProps = image.props({
  src: '/hero.jpg',
  alt: 'Hero image',
  width: 1200,
  height: 600,
});
// Returns: src, srcSet, sizes, loading, etc.
```

- Automatic format conversion (WebP, AVIF)
- Responsive srcset generation
- Lazy loading by default
- Cache optimization

### 📄 Static Site Generation (SSG + ISR)

```tsx
import { ssg, defineStaticPaths, defineStaticProps } from '@float/core';

// Define which paths to pre-render
export const getStaticPaths = defineStaticPaths(async () => ({
  paths: [
    { params: { slug: 'hello' } },
    { params: { slug: 'world' } },
  ],
  fallback: 'blocking',
}));

// Fetch data at build time with ISR
export const getStaticProps = defineStaticProps(async ({ params }) => ({
  props: { post: await getPost(params.slug) },
  revalidate: 60, // Re-generate every 60 seconds
}));

// On-demand revalidation API
await ssg.engine().revalidate('/blog/hello', getStaticProps, render);
```

- Build-time static generation
- Incremental Static Regeneration
- On-demand revalidation
- Memory + disk caching

### 📈 Built-in Analytics (No Third-Party!)

```tsx
import { analytics } from '@float/core';

// Configure
analytics.configure({
  trackVitals: true,
  hashIPs: true, // GDPR-friendly
});

// Auto-track pageviews
app.use(analytics.createMiddleware());

// Track custom events
analytics.track.event('purchase', { 
  product: 'Float Pro', 
  amount: 99 
});

// Get dashboard at /__float/analytics
const summary = analytics.engine().getSummary();
// { pageviews, vitals, sessions, bounceRate... }
```

- Zero-config Web Vitals (LCP, FCP, CLS)
- Privacy-focused (no cookies, hash IPs)
- Real-time dashboard
- Custom event tracking

### 🌊 Streaming SSR

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

- React 18 streaming out of the box
- Progressive HTML delivery
- Suspense boundaries
- Fastest time-to-content

### 🔮 AI-Ready Architecture

```tsx
// Built-in patterns for AI integration
export async function generateResponse(prompt: string) {
  const stream = await ai.stream(prompt);
  return new StreamingResponse(stream);
}
```

- Server Actions
- Streaming responses
- LLM workflow optimization
- Edge-ready

### 📦 Zero Configuration

```bash
# Just works. TypeScript, ESLint, and more.
npx create-float@latest my-app
```

- TypeScript by default
- ESLint preconfigured
- Path aliases (`@/`)
- Optimal defaults

## 🏗️ Project Structure

```
my-app/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── about/
│   │   └── page.tsx    # /about
│   └── api/
│       └── hello/
│           └── route.ts # /api/hello
├── public/             # Static assets
├── float.config.ts     # Configuration (optional)
└── package.json
```

## 📖 Documentation

Visit [floatjs.dev/docs](https://floatjs.dev/docs) for the full documentation.

- [Getting Started](https://floatjs.dev/docs/getting-started)
- [Routing](https://floatjs.dev/docs/routing)
- [Data Fetching](https://floatjs.dev/docs/data-fetching)
- [Styling](https://floatjs.dev/docs/styling)
- [Deployment](https://floatjs.dev/docs/deployment)
- [API Reference](https://floatjs.dev/docs/api)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/float-js/float-js.git

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@float/core](packages/core) | Core framework, CLI, router, SSR engine |
| [create-float](packages/create-float) | Project scaffolding CLI |

> 📦 **Coming soon to npm!** Packages will be published once v1.0 is ready.

## 🗺️ Roadmap

- [x] File-based routing
- [x] SSR with streaming
- [x] Hot module replacement
- [x] TypeScript support
- [x] Native AI integration (OpenAI, Anthropic)
- [x] Type-safe API validation
- [x] Real-time WebSocket support
- [x] Dev Dashboard
- [x] Edge Middleware
- [x] Image Optimization
- [x] Static Site Generation (SSG)
- [x] Incremental Static Regeneration (ISR)
- [x] Built-in Analytics

## 💬 Community

- [Discord](https://discord.gg/floatjs) - Chat with the community
- [Twitter](https://twitter.com/floatjs) - Latest updates
- [GitHub Discussions](https://github.com/float-js/float-js/discussions) - Q&A

## 📄 License

Float.js is [MIT licensed](LICENSE).

---

<p align="center">
  <strong>Built with ⚡ for the modern web</strong>
</p>

<p align="center">
  <a href="https://floatjs.dev">Website</a> •
  <a href="https://floatjs.dev/docs">Docs</a> •
  <a href="https://github.com/float-js/float-js">GitHub</a>
</p> 
