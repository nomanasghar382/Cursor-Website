#!/bin/sh
set -eu

echo "NOVAEX backend container starting..."
echo "PORT=${PORT:-4000}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Link Postgres in Railway Variables."
  exit 1
fi

if [ -z "${REDIS_URL:-}" ] && [ "${REDIS_HOST:-localhost}" = "localhost" ]; then
  echo "WARNING: REDIS_URL is not set. Link Redis with REDIS_URL=\${{Redis.REDIS_URL}}"
fi

run_migrations() {
  (cd /database && npx prisma migrate deploy --config prisma.config.ts)
}

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  if ! run_migrations; then
    if [ "${AUTO_FIX_FAILED_MIGRATIONS:-true}" = "true" ]; then
      echo "Recovering from a previous failed migration..."
      (cd /database && npx prisma migrate resolve --rolled-back 0001_novaex_initial --config prisma.config.ts) 2>/dev/null || true
      if ! run_migrations; then
        echo ""
        echo "ERROR: Database migration failed."
        echo "Use Railway Postgres with pgvector template (not standard Postgres)."
        echo "Check DATABASE_URL points to the pgvector database service."
        echo ""
        exit 1
      fi
    else
      echo "ERROR: Database migration failed."
      exit 1
    fi
  fi
  echo "Database migrations complete."
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database (this can take 1-2 minutes on first deploy)..."
  if ! (cd /database && npx tsx prisma/seed/seed.ts); then
    echo "ERROR: Database seed failed."
    exit 1
  fi
  echo "Database seed complete."
fi

echo "Starting NOVAEX API on port ${PORT:-4000}..."
cd /app
exec node dist/main.js
