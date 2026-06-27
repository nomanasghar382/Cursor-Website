# NEXORA AI Frontend

Ultra-premium React/Vite frontend for a futuristic AI-powered commerce platform.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- Three.js + React Three Fiber + Drei
- GSAP ScrollTrigger
- Framer Motion

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## 3D assets

The current implementation uses procedural PBR-style geometry so the landing page works immediately. Final Blender, Spline, or marketplace GLB models can be placed in `public/models` and wired into `src/components/MarketplaceScene.tsx`.
