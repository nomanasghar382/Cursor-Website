# NOVAEX Enterprise Frontend

Next.js 15 enterprise frontend foundation for the NOVAEX AI commerce platform.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn UI primitives (Radix)
- Framer Motion + GSAP-ready motion layer
- React Three Fiber hero scene
- Zustand auth/UI stores
- TanStack Query
- React Hook Form + Zod
- Lucide icons + next-themes

## Development

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`  
API: `http://localhost:4000/api/v1`

## Architecture

```
src/
├── app/                 # App Router layouts, pages, SEO routes
├── components/
│   ├── ui/              # Design system primitives
│   ├── layout/          # Header, footer, sidebars
│   ├── motion/          # Animation system
│   ├── commerce/        # Product/category components
│   ├── search/          # Search + command palette
│   └── three/           # R3F scenes
├── features/            # Feature modules (auth, catalog)
├── hooks/               # Shared hooks
├── lib/                 # API client, SEO, animations, fonts
├── providers/           # Theme + query providers
├── stores/              # Zustand stores
├── types/               # Shared TypeScript types
└── config/              # Site + navigation config
```

## Key routes

| Route | Purpose |
|---|---|
| `/` | Premium marketing home + live catalog |
| `/products` | Server-rendered product catalog |
| `/products/[id]` | Product detail with dynamic metadata |
| `/ai` | AI studio search experience |
| `/login` / `/register` | Enterprise auth forms |
| `/account` | Account center |
| `/account/security` | Security dashboard |
| `/enterprise` | Enterprise capabilities overview |

## API integration

The frontend uses a typed API client with:

- Bearer token support via Zustand auth store
- Cookie credentials for refresh/session flows
- NestJS response wrapper unwrapping (`data` payload)

## Performance

- Server Components for catalog and marketing pages
- Dynamic import for Three.js hero scene
- Image optimization config in `next.config.ts`
- `optimizePackageImports` for lucide-react and framer-motion

## Accessibility

- WCAG-oriented focus states and ARIA labels
- Reduced motion support via `prefers-reduced-motion`
- Keyboard command palette (`Cmd/Ctrl + K`)
