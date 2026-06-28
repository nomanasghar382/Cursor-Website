#!/bin/sh
set -eu

echo "NOVAEX backend container starting..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Check docker-compose environment."
  exit 1
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  if ! (cd /database && npx prisma migrate deploy); then
    echo "ERROR: Database migration failed."
    exit 1
  fi
  echo "Database migrations complete."
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  if ! (cd /database && npx tsx prisma/seed/seed.ts); then
    echo "ERROR: Database seed failed."
    exit 1
  fi
  echo "Database seed complete."
fi

echo "Starting NOVAEX API..."
exec node dist/main.js
