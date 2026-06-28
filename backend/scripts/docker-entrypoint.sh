#!/bin/sh
set -eu

echo "NOVAEX backend container starting..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Check docker-compose environment."
  exit 1
fi

run_migrations() {
  cd /database && npx prisma migrate deploy
}

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  if ! run_migrations; then
    if [ "${AUTO_FIX_FAILED_MIGRATIONS:-true}" = "true" ]; then
      echo "Recovering from a previous failed migration (local Docker)..."
      cd /database
      npx prisma migrate resolve --rolled-back 0001_novaex_initial 2>/dev/null || true
      if ! npx prisma migrate deploy; then
        echo ""
        echo "ERROR: Database migration still failing."
        echo "Your Postgres volume has a broken migration from earlier attempts."
        echo "Reset the database volume, then start again:"
        echo "  docker compose down -v"
        echo "  docker compose up --build"
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
  echo "Seeding database..."
  if ! (cd /database && npx tsx prisma/seed/seed.ts); then
    echo "ERROR: Database seed failed."
    exit 1
  fi
  echo "Database seed complete."
fi

echo "Starting NOVAEX API..."
exec node dist/main.js
