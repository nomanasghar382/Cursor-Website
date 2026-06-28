# NOVAEX Testing Guide

Enterprise QA system for the NOVAEX platform (frontend, backend, database, API, E2E, security, performance).

## Stack

| Layer | Tools |
|-------|-------|
| Frontend unit/component | Jest, React Testing Library |
| Frontend E2E | Playwright |
| Backend unit | Jest |
| Backend integration | Jest + Supertest + full AppModule |
| Database | Prisma migrate + seed test environment |
| API contract | Postman collection + Newman |
| Performance | Node smoke script (`tests/performance/api-smoke.mjs`) |
| CI/CD | `.github/workflows/qa.yml` |

## Quick commands

```bash
# Full local QA (Postgres + Redis required)
chmod +x tests/scripts/*.sh
./tests/scripts/run-all-tests.sh

# Backend
cd backend
npm test                 # unit
npm run test:cov         # unit + coverage
npm run test:integration # Supertest against real app + DB

# Frontend
cd frontend
npm test
npm run test:cov
npm run test:e2e         # Playwright (app must be running or use CI webServer)

# Newman API tests
./tests/scripts/run-newman.sh

# Test database setup
./tests/scripts/setup-test-db.sh
```

## Test layout

```
tests/
├── e2e/specs/              # Playwright user journeys
├── postman/                # Newman-compatible API collection
├── performance/            # API response-time smoke
├── scripts/                # Orchestration scripts
└── setup/test-env.example  # Shared environment template

frontend/src/**/*.test.ts(x)   # Jest unit + component tests
backend/src/**/*.spec.ts       # Jest unit tests
backend/test/**/*.e2e-spec.ts  # Integration tests
```

## Environment

Copy `tests/setup/test-env.example` values into `backend/.env.test` or export before integration tests:

- `DATABASE_URL` — Postgres with migrated schema
- `REDIS_HOST` / `REDIS_PORT` — Redis for sessions and queues
- JWT, cookie, Stripe, Resend placeholders (see example file)

Integration tests apply defaults via `backend/test/test-env.ts` when variables are unset.

## Coverage

| Package | Command | Output |
|---------|---------|--------|
| Backend | `npm run test:cov` | `backend/coverage/` |
| Frontend | `npm run test:cov` | `frontend/coverage/` |

Thresholds are configured in `backend/jest.config.cjs` and `frontend/jest.config.ts`.

## Test categories

### Unit tests

**Frontend:** API client/errors, auth Zod schemas, Zustand stores (auth, commerce, catalog), utilities, `ProductCardView`, `LoginForm`.

**Backend:** Auth, security (password/MFA/brute-force), health, uploads, monitoring, cart, payment fulfillment, AI ranking, authorization, products, crypto, environment schema.

### Integration tests

Bootstrapped via `backend/test/helpers/bootstrap-app.ts`:

- Health liveness/readiness
- Security (401/400, SQLi/XSS payloads, DTO whitelist)
- Products catalog
- Auth registration flow
- Lightweight controller e2e scaffolds (`auth.e2e-spec.ts`, `app.e2e-spec.ts`)

### E2E journeys (Playwright)

- Marketing homepage and catalog browse/search
- Auth pages (login, register, forgot password)
- Cart, checkout, AI page
- Admin and vendor login portals
- **Authenticated customer** — account dashboard, cart, orders (`authenticated-customer.spec.ts`)
- **Authenticated admin** — dashboard, products, orders (`authenticated-admin.spec.ts`)
- **Authenticated vendor** — dashboard, products, orders (`authenticated-vendor.spec.ts`)
- **Checkout + Stripe simulation** — API webhook simulation and confirmation page (`checkout-payment.spec.ts`)

Seeded credentials for E2E:

| Role | Email | Password |
|------|-------|----------|
| Customer | `maya.chen@example.com` | `NOVAEX-Customer-2026!` |
| Admin / Vendor | `admin@novaex.ai` | `NOVAEX-Admin-2026!` |

Enable payment simulation for checkout E2E:

```bash
ENABLE_TEST_PAYMENT_SIMULATION=true npm run test:e2e
```

Set `PLAYWRIGHT_SKIP_WEBSERVER=1` when apps are already running.

### Security testing

- Protected routes without tokens (401)
- Invalid bearer tokens
- DTO `forbidNonWhitelisted` (unknown fields rejected)
- SQL injection and XSS payloads in search/register
- Upload MIME validation (`file-validation.pipe.spec.ts`)
- Newman security folder in Postman collection

### Performance testing

`tests/performance/api-smoke.mjs` asserts response times for health, products, and blog endpoints. Tune with `PERF_BUDGET_MS` and `API_URL`.

## CI/CD

`qa.yml` runs on every PR:

1. Backend unit tests + coverage artifact
2. Backend integration (migrate, seed, Supertest)
3. Frontend lint, typecheck, Jest coverage
4. Newman API collection against live server
5. Performance smoke

Existing `backend.yml` and `frontend.yml` workflows remain for path-filtered PR checks.

## Manual smoke

1. `docker compose up --build`
2. Open `http://localhost:3000`
3. Confirm `http://localhost:4000/api/v1/health/ready`
4. Register/login, add to cart, reach checkout
5. Run `./tests/scripts/run-newman.sh`

## Related docs

- `QA_REPORT.md` — audit findings, bugs, production readiness
- `DEPLOYMENT.md` — production deployment
- `LAUNCH_AUDIT.md` — launch readiness score
