/**
 * Default environment variables for backend integration tests.
 * CI and local runners should set DATABASE_URL before importing AppModule.
 */
export function applyTestEnvironment() {
  const defaults: Record<string, string> = {
    NODE_ENV: "test",
    DATABASE_URL:
      process.env.DATABASE_URL ??
      "postgresql://novaex_user:novaex_password@localhost:5432/novaex?schema=public",
    REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
    REDIS_PORT: process.env.REDIS_PORT ?? "6379",
    JWT_ACCESS_SECRET: "test-access-secret-with-more-than-twenty-four-characters",
    JWT_REFRESH_SECRET: "test-refresh-secret-with-more-than-twenty-four-characters",
    COOKIE_SECRET: "test-cookie-secret-with-more-than-twenty-four-characters",
    BETTER_AUTH_SECRET: "test-better-auth-secret-with-more-than-twenty-four-characters",
    BETTER_AUTH_URL: "http://localhost:4000",
    CLOUDINARY_CLOUD_NAME: "test",
    CLOUDINARY_API_KEY: "test",
    CLOUDINARY_API_SECRET: "test",
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET: "whsec_placeholder",
    RESEND_API_KEY: "re_test_placeholder",
    MAIL_FROM: "NOVAEX <test@novaex.ai>",
    CSRF_ENABLED: "false",
    RATE_LIMIT_MAX: "10000",
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
