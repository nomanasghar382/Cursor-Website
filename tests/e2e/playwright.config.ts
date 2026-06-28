import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:4000/api/v1";

export default defineConfig({
  testDir: "./specs",
  globalSetup: "./global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../reports/playwright" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: "npm run start",
          cwd: "../../backend",
          url: `${apiURL}/health/live`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            NODE_ENV: "test",
            ENABLE_TEST_PAYMENT_SIMULATION: "true",
            DATABASE_URL:
              process.env.DATABASE_URL ??
              "postgresql://novaex_user:novaex_password@localhost:5432/novaex?schema=public",
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
            CSRF_ENABLED: "false",
          },
        },
        {
          command: "npm run start",
          cwd: "../../frontend",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            NEXT_PUBLIC_API_URL: apiURL,
            NEXT_PUBLIC_APP_URL: baseURL,
          },
        },
      ],
});
