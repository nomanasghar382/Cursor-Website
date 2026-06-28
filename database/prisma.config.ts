import { createRequire } from "node:module";
import { defineConfig, env } from "prisma/config";

const require = createRequire(import.meta.url);

try {
  require("dotenv/config");
} catch {
  // In Docker/CI, DATABASE_URL is injected via the environment.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
