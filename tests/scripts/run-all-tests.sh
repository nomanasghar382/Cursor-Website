#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export DATABASE_URL="${DATABASE_URL:-postgresql://novaex_user:novaex_password@localhost:5432/novaex_test?schema=public}"

echo "==> NOVAEX full QA run"

if [[ "${SKIP_DB_SETUP:-0}" != "1" ]]; then
  "$ROOT/tests/scripts/setup-test-db.sh"
fi

echo "==> Backend unit tests"
(cd "$ROOT/backend" && npm test)

echo "==> Backend integration tests"
(cd "$ROOT/backend" && npm run test:integration)

echo "==> Frontend unit tests"
(cd "$ROOT/frontend" && npm test)

echo "==> Performance smoke"
node "$ROOT/tests/performance/api-smoke.mjs" || true

echo "==> QA run complete"
