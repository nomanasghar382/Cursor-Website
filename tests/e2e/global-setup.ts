import { execSync } from "node:child_process";
import path from "node:path";

const rootDir = path.resolve(process.cwd(), process.cwd().endsWith("frontend") ? ".." : "../..");

const sharedEnv: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://novaex_user:novaex_password@localhost:5432/novaex?schema=public",
  NODE_ENV: "test",
  JWT_ACCESS_SECRET: "test-access-secret-with-more-than-twenty-four-characters",
  JWT_REFRESH_SECRET: "test-refresh-secret-with-more-than-twenty-four-characters",
  COOKIE_SECRET: "test-cookie-secret-with-more-than-twenty-four-characters",
  BETTER_AUTH_SECRET: "test-better-auth-secret-with-more-than-twenty-four-characters",
  BETTER_AUTH_URL: "http://localhost:4000",
  CLOUDINARY_CLOUD_NAME: "test",
  CLOUDINARY_API_KEY: "test",
  CLOUDINARY_API_SECRET: "test",
  STRIPE_SECRET_KEY: "sk_test_simulation",
  STRIPE_WEBHOOK_SECRET: "whsec_simulation",
  STRIPE_PUBLISHABLE_KEY: "pk_test_simulation",
  RESEND_API_KEY: "re_test_simulation",
  MAIL_FROM: "NOVAEX <test@novaex.ai>",
  ENABLE_TEST_PAYMENT_SIMULATION: "true",
  CSRF_ENABLED: "false",
  NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_DB_SETUP === "1") {
    return;
  }

  execSync("npm ci", { cwd: path.join(rootDir, "database"), stdio: "inherit", env: sharedEnv });
  execSync("npm run migrate:deploy && npm run seed", {
    cwd: path.join(rootDir, "database"),
    stdio: "inherit",
    env: sharedEnv,
  });

  execSync("npm ci && npm run build", {
    cwd: path.join(rootDir, "backend"),
    stdio: "inherit",
    env: sharedEnv,
  });

  execSync("npm ci && npm run build", {
    cwd: path.join(rootDir, "frontend"),
    stdio: "inherit",
    env: sharedEnv,
  });
}
