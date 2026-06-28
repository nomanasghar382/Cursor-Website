#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATABASE_URL="${DATABASE_URL:-postgresql://novaex_user:novaex_password@localhost:5432/novaex_test?schema=public}"

echo "==> Preparing Prisma test database"
cd "$ROOT/database"
export DATABASE_URL
npm run migrate:deploy
npm run seed

echo "==> Test database ready: $DATABASE_URL"
