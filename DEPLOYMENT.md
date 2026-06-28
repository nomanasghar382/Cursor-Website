# NOVAEX Deployment Guide

## Prerequisites

- Node.js 24+
- PostgreSQL 17 with pgvector
- Redis 8
- Environment files from `backend/.env.example` and `frontend/.env.example`

## Local development

```bash
# Database
cd database && npm ci && npm run validate

# Backend
cd backend && npm ci && cp .env.example .env
npm run build && npm run dev

# Frontend
cd frontend && npm ci && cp .env.example .env
npm run dev
```

## Docker Compose (recommended for staging)

See also **[Render deployment](docs/RENDER.md)** if local Docker is painful — the backend can run on Render's cloud build instead.

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with production secrets

docker compose up --build
```

Services:

| Service | URL | Health |
|---------|-----|--------|
| Frontend | http://localhost:3000 | `GET /` |
| Backend | http://localhost:4000/api/v1 | `GET /api/v1/health/ready` |
| Postgres | localhost:5432 | container healthcheck |
| Redis | localhost:6379 | container healthcheck |

The backend container runs `prisma migrate deploy` on startup when `RUN_MIGRATIONS=true`.

## Production checklist

1. Set `NODE_ENV=production`
2. Use strong secrets (24+ chars) for JWT, cookies, and auth
3. Set `WEB_ORIGINS` to your real frontend domains
4. Enable `CSRF_ENABLED=true` when using cookie-based auth from the browser
5. Disable Swagger (automatic in production)
6. Configure TLS at the reverse proxy (nginx, Cloudflare, ALB)
7. Point health probes to `/api/v1/health/live` and `/api/v1/health/ready`
8. Schedule Postgres backups (daily snapshots + WAL archiving)

## CI/CD

GitHub Actions workflows:

- `backend.yml` — Prisma validate, backend build, unit + e2e tests
- `frontend.yml` — lint, typecheck, vitest, production build
- `security-audit.yml` — weekly `npm audit` across workspaces

## Backup strategy

- **Database**: nightly `pg_dump` to object storage; test restores monthly
- **Redis**: AOF persistence enabled in Compose; snapshot for cache-only data
- **Media**: Cloudinary is the system of record for uploaded assets

## Monitoring

- Liveness: `GET /api/v1/health/live`
- Readiness: `GET /api/v1/health/ready`
- Architecture reference: `GET /api/v1/admin/monitoring/architecture` (admin)

Integrate request logs (`LoggingInterceptor`) with your log aggregator and wire alerts on readiness failures.
