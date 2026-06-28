const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";
const BUDGET_MS = Number(process.env.PERF_BUDGET_MS ?? 3000);

const endpoints = [
  { name: "health-live", path: "/health/live", budget: 500 },
  { name: "products-list", path: "/products?limit=24", budget: BUDGET_MS },
  { name: "growth-blog", path: "/growth/blog?limit=5", budget: BUDGET_MS },
];

async function measure(path: string) {
  const started = performance.now();
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  const duration = performance.now() - started;
  return { status: response.status, duration };
}

let failures = 0;

for (const endpoint of endpoints) {
  const result = await measure(endpoint.path);
  const ok = result.status < 500 && result.duration <= endpoint.budget;
  const status = ok ? "PASS" : "FAIL";
  if (!ok) failures += 1;
  console.log(
    `[${status}] ${endpoint.name} status=${result.status} duration=${result.duration.toFixed(0)}ms budget=${endpoint.budget}ms`,
  );
}

if (failures > 0) {
  process.exitCode = 1;
}
