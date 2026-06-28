#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npm run migrate:deploy
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  (cd /database && npm ci --omit=dev && npm run seed)
fi

exec node dist/main.js
