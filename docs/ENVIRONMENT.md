# Environment Setup

## Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_HOST` / `REDIS_PORT` | Yes | Redis connection |
| `JWT_ACCESS_SECRET` | Yes | Min 24 characters |
| `JWT_REFRESH_SECRET` | Yes | Min 24 characters |
| `COOKIE_SECRET` | Yes | Cookie signing secret |
| `FRONTEND_URL` | Recommended | Web app URL for auth emails |
| `WEB_ORIGINS` | Yes | CORS allowed origins (comma-separated) |
| `STRIPE_SECRET_KEY` | Yes | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Frontend Stripe.js key |
| `RESEND_API_KEY` | Yes | Transactional email |
| `CLOUDINARY_*` | Yes | Media storage |
| `CSRF_ENABLED` | No | Enable in production with cookie auth |
| `RUN_MIGRATIONS` | Docker | Run migrations on container start |
| `RUN_SEED` | Docker | Seed demo data (first deploy only) |

## Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `http://localhost:3000` |

## Database

```bash
cd database
cp .env.example .env   # set DATABASE_URL
npm run migrate:deploy
npm run seed
```

## Validation

Backend env is validated at startup via Zod (`environment.schema.ts`).  
Frontend env is validated in `frontend/src/config/env.ts`.
