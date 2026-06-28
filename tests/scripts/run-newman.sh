#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_URL="${API_URL:-http://localhost:4000/api/v1}"

if ! command -v newman >/dev/null 2>&1; then
  echo "Installing newman..."
  npm install -g newman
fi

newman run "$ROOT/tests/postman/novaex-api.postman_collection.json" \
  --environment "$ROOT/tests/postman/novaex-local.postman_environment.json" \
  --env-var "baseUrl=$API_URL" \
  --reporters cli,junit \
  --reporter-junit-export "$ROOT/tests/reports/newman.junit.xml"
