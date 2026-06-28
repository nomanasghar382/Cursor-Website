#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npm run migrate:deploy
fi

exec node dist/main.js
