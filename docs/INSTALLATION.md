# Installation Guide

## Option A — Local development

### 1. Clone and install

```bash
git clone <repository-url>
cd <repo>
```

### 2. Database

```bash
cd database
npm ci
cp .env.example .env
# Edit DATABASE_URL
npm run migrate:deploy
npm run seed
```

### 3. Backend

```bash
cd backend
npm ci
cp .env.example .env
# Fill secrets — see docs/ENVIRONMENT.md
npm run dev
```

API available at `http://localhost:4000/api/v1`

### 4. Frontend

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Storefront at `http://localhost:3000`

## Option B — Docker Compose

```bash
cp backend/.env.example backend/.env
# Configure secrets
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000/api/v1 |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

For first-time demo data:

```bash
RUN_SEED=true docker compose up --build
```

## Verify installation

```bash
curl http://localhost:4000/api/v1/health/ready
cd backend && npm test
cd frontend && npm test && npm run build
```

## Troubleshooting

- **DB connection failed:** Ensure Postgres is running and `DATABASE_URL` matches
- **CORS errors:** Add frontend origin to `WEB_ORIGINS`
- **Stripe webhook fails:** Use Stripe CLI for local forwarding; ensure raw body is enabled

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production setup.
