# Developer Guide

## Prerequisites

- Node.js 24+
- PostgreSQL 17 (pgvector)
- Redis 8

## Workspace commands

```bash
# Backend
cd backend && npm run dev        # API on :4000
cd backend && npm test           # Jest unit tests
cd backend && npm run test:e2e   # HTTP e2e scaffold

# Frontend
cd frontend && npm run dev       # Next.js on :3000
cd frontend && npm test          # Vitest
cd frontend && npm run build

# Database
cd database && npm run migrate:deploy
cd database && npm run seed
```

## Architecture

- **API prefix:** `/api/v1`
- **Auth:** JWT Bearer + httpOnly signed cookies
- **Permissions:** RBAC via `@Permissions()` decorator
- **Queues:** BullMQ on Redis (audit, email architecture)

## Adding a feature module (backend)

1. Create `src/modules/<name>/` with `*.module.ts`, controller, service, repository
2. Register in `app.module.ts`
3. Add DTOs with `class-validator`
4. Add unit tests alongside services

## Adding a page (frontend)

1. Use route groups: `(marketing)`, `(commerce)`, `(account)`, `(admin)`, `(vendor)`
2. Call APIs via `frontend/src/lib/api/*`
3. Use `buildMetadata()` from `lib/seo.ts` for SEO

## API documentation

Swagger (development only): `http://localhost:4000/api/v1/docs`

## Environment

See `backend/.env.example`, `frontend/.env.example`, and [ENVIRONMENT.md](./ENVIRONMENT.md).
