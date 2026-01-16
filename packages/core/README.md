# Float.js ⚡

> Ultra Modern Web Framework for React

Float.js is a blazing-fast, full-stack React framework with file-based routing, server-side rendering, and an exceptional developer experience.

## Features

- ⚡ **HMR Ultra Rápido** - Hot Module Replacement instantáneo con WebSockets
- 📁 **File-based Routing** - Rutas automáticas basadas en estructura de carpetas
- 🖥️ **SSR** - Server-Side Rendering integrado
- 📡 **API Routes** - Crea APIs con archivos `route.ts`
- 🤖 **AI Ready** - Soporte nativo para streaming con OpenAI/Anthropic
- 📊 **Dev Dashboard** - Panel de desarrollo en `/__float`
- 🎨 **Tailwind CSS** - Auto-setup automático con PostCSS
- 🔄 **Layouts** - Layouts anidados con jerarquía automática
- ⏳ **Loading States** - Loading UI con Suspense boundaries
- 💾 **Persistent Cache** - Builds 10x más rápidos con caché en disco

## Quick Start

```bash
# Create a new project
npx create-float my-app
cd my-app

# Or install in existing project
npm install @float.js/core react react-dom

# Start development server
npx float dev
```

## Project Structure

```
my-app/
├── app/
│   ├── page.tsx          → /
│   ├── about/
│   │   └── page.tsx      → /about
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx  → /blog/:slug
│   └── api/
│       └── hello/
│           └── route.ts  → /api/hello
├── public/
└── package.json
```

## Pages

Create React components in the `app/` directory:

```tsx
// app/page.tsx
export default function Home() {
  return <h1>Welcome to Float.js!</h1>
}
```

## API Routes

Create API endpoints with `route.ts` files:

```ts
// app/api/hello/route.ts
export function GET(request: Request) {
  return Response.json({ message: 'Hello from Float!' })
}

export function POST(request: Request) {
  return Response.json({ status: 'created' }, { status: 201 })
}
```

## Tailwind CSS

Float.js automatically sets up Tailwind CSS when you run `float dev`. If Tailwind isn't configured, it will:

1. Create `tailwind.config.js`
2. Create `postcss.config.js`
3. Create `app/globals.css` with Tailwind directives
4. Create `app/layout.tsx` to import global styles

Install Tailwind dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer
```

Your components will automatically use Tailwind classes:

```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-blue-600">Hello Float!</h1>
    </div>
  )
}
```

## Layouts & Loading States

Create shared UI with layouts and loading states:

```tsx
// app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>My App</nav>
        {children}
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  )
}

// app/dashboard/loading.tsx - Loading UI
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

Layouts are nested automatically: `RootLayout` → `DashboardLayout` → `Page`

## CLI Commands

| Command | Description |
|---------|-------------|
| `float dev` | Start development server with HMR |
| `float build` | Build for production |
| `float start` | Start production server |
| `float info` | Show environment information |

## Requirements

- Node.js 18+
- React 18.2+ or React 19+

## License

MIT © Float.js
