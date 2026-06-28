import { validateEnvironment } from "./environment.schema";

describe("validateEnvironment", () => {
  it("normalizes CSV origins and numeric limits", () => {
    const env = validateEnvironment({
      DATABASE_URL: "postgresql://novaex_user:novaex_password@localhost:5432/novaex?schema=public",
      JWT_ACCESS_SECRET: "access-secret-with-more-than-twenty-four-characters",
      JWT_REFRESH_SECRET: "refresh-secret-with-more-than-twenty-four-characters",
      COOKIE_SECRET: "cookie-secret-with-more-than-twenty-four-characters",
      BETTER_AUTH_SECRET: "better-auth-secret-with-more-than-twenty-four-characters",
      BETTER_AUTH_URL: "http://localhost:4000",
      CLOUDINARY_CLOUD_NAME: "novaex",
      CLOUDINARY_API_KEY: "key",
      CLOUDINARY_API_SECRET: "secret",
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_WEBHOOK_SECRET: "whsec",
      RESEND_API_KEY: "re_test",
      MAIL_FROM: "NOVAEX <no-reply@novaex.ai>",
      WEB_ORIGINS: "http://localhost:5173,http://127.0.0.1:5173",
      RATE_LIMIT_MAX: "100",
    });

    expect(env.WEB_ORIGINS).toEqual(["http://localhost:5173", "http://127.0.0.1:5173"]);
    expect(env.RATE_LIMIT_MAX).toBe(100);
    expect(env.MFA_ISSUER).toBe("NOVAEX");
    expect(env.MAX_LOGIN_ATTEMPTS).toBe(5);
    expect(env.PASSWORD_EXPIRY_DAYS).toBe(90);
  });
});
