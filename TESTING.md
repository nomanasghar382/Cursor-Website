# NOVAEX Testing Guide

## Backend

```bash
cd backend
npm ci
npm test          # unit tests
npm run test:e2e  # lightweight HTTP e2e scaffold
npm run build
```

### Coverage areas

| Area | Spec file |
|------|-----------|
| Environment validation | `src/config/environment.schema.spec.ts` |
| Auth & security | `src/modules/auth`, `src/modules/security` |
| Health probes | `src/health/health.service.spec.ts` |
| Upload validation | `src/uploads/pipes/file-validation.pipe.spec.ts` |
| Monitoring metadata | `src/monitoring/monitoring.service.spec.ts` |

CI runs unit and e2e tests on every backend change.

## Frontend

```bash
cd frontend
npm ci
npm test          # vitest unit tests
npm run typecheck
npm run lint
npm run build
```

### Current frontend tests

- `src/lib/api/client.test.ts` — API client success/error handling
- `src/lib/api/errors.ts` — typed error helpers

### Recommended next tests

- Component tests for auth forms and checkout with Vitest + Testing Library
- Playwright e2e for login, catalog browse, and checkout happy path

## Security testing

- Run `npm audit --audit-level=high` in `backend`, `frontend`, and `database`
- Validate CSRF, rate limiting, and JWT flows in staging with `CSRF_ENABLED=true`
- Verify upload rejection for disallowed MIME types and extensions

## Performance testing

- Measure `/products` server render and API fan-out under load (k6 or Artillery)
- Monitor `durationMs` in API logs via `LoggingInterceptor`
- Use Lighthouse CI against homepage and product detail pages

## Manual smoke test

1. `docker compose up --build`
2. Open `http://localhost:3000`
3. Confirm `http://localhost:4000/api/v1/health/ready` returns `ok`
4. Register/login, add to cart, and reach checkout
5. Open admin dashboards and verify API responses
