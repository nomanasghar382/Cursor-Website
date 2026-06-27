# NEXORA AI Commerce Platform (Frontend + Node.js Backend)

Ultra-premium React/Vite storefront with a Node.js API for auth, products, cart, wishlist, and checkout.

## Stack

- Frontend: React + TypeScript + Vite
- TailwindCSS
- Three.js + React Three Fiber + Drei
- GSAP ScrollTrigger
- Framer Motion
- Backend: Node.js + Express + JWT + Zod

## Local development

### 1) Start backend API

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000` with API routes under `/api`.

### 2) Start frontend

```bash
cd ..
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and calls `http://localhost:4000/api` by default.

Optional env override:

```bash
VITE_API_URL=http://localhost:4000/api
```

## Production build

```bash
npm run build
```

## 3D assets

The current implementation uses procedural PBR-style geometry so the landing page works immediately. Final Blender, Spline, or marketplace GLB models can be placed in `public/models` and wired into `src/components/MarketplaceScene.tsx`.
