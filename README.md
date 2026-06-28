# NOVAEX — AI-Native Enterprise Commerce

NOVAEX is a full-stack ecommerce platform with AI discovery, vendor marketplace operations, fulfillment, CMS/marketing, and enterprise admin tooling.

## Monorepo structure

| Path | Stack | Purpose |
|------|-------|---------|
| `frontend/` | Next.js 15, React 19, Tailwind | Customer storefront, account, admin & vendor portals |
| `backend/` | NestJS, Prisma, Redis, BullMQ | REST API, auth, payments, fulfillment, AI |
| `database/` | PostgreSQL 17 + pgvector | Schema, migrations, seed data |

> The legacy Vite app at the repository root is deprecated. Use `frontend/` for all storefront work.

## Quick start

```bash
# 1. Database
cd database && npm ci && npm run migrate:deploy && npm run seed

# 2. Backend API (port 4000)
cd backend && npm ci && cp .env.example .env
npm run dev

# 3. Frontend (port 3000)
cd frontend && npm ci && cp .env.example .env
npm run dev
```

**Demo credentials** (after seed):

- Admin: `admin@novaex.ai` / `NOVAEX-Admin-2026!`
- Customer: `customer1@novaex.ai` / `NOVAEX-Customer-2026!`

## Docker

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Launch Audit](./LAUNCH_AUDIT.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)
- [User Guide](./docs/USER_GUIDE.md)

## API docs

Swagger UI (non-production): `http://localhost:4000/api/v1/docs`

## License

Proprietary — NOVAEX AI Commerce.
