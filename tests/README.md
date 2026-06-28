# NOVAEX Quality Assurance System

Enterprise testing layout for the NOVAEX platform.

## Structure

```
tests/
├── README.md                 # This file
├── scripts/                  # Orchestration scripts
│   ├── run-all-tests.sh
│   ├── setup-test-db.sh
│   └── run-newman.sh
├── setup/
│   └── test-env.example      # Shared test environment template
├── postman/                  # Newman-compatible API collections
│   ├── novaex-api.postman_collection.json
│   └── novaex-local.postman_environment.json
├── performance/              # Load and response-time smoke tests
│   └── api-smoke.mjs
└── e2e/                      # Playwright end-to-end journeys
    ├── playwright.config.ts
    └── specs/
```

Application tests live next to source:

| Layer | Location | Runner |
|-------|----------|--------|
| Frontend unit/component | `frontend/src/**/*.test.{ts,tsx}` | Jest + RTL |
| Backend unit | `backend/src/**/*.spec.ts` | Jest |
| Backend integration/e2e | `backend/test/**/*.e2e-spec.ts` | Jest + Supertest |
| Browser e2e | `tests/e2e/specs/` | Playwright |

## Quick start

```bash
# Full local QA (unit + integration; requires Postgres + Redis)
./tests/scripts/run-all-tests.sh

# Frontend only
cd frontend && npm test

# Backend unit
cd backend && npm test

# Backend integration (Postgres + Redis required)
cd backend && npm run test:e2e

# API collection (Newman)
./tests/scripts/run-newman.sh

# Playwright (app must be running)
cd tests/e2e && npx playwright test
```

## Coverage

```bash
cd backend && npm run test:cov
cd frontend && npm run test:cov
```

Reports are written to `backend/coverage/` and `frontend/coverage/`.

## CI

GitHub Actions workflow `.github/workflows/qa.yml` runs the full matrix on every PR.
