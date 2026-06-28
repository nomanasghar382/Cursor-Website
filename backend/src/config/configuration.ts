import { EnvironmentVariables } from "./environment.schema";

export default function configuration(env: EnvironmentVariables) {
  return {
    app: {
      name: env.APP_NAME,
      nodeEnv: env.NODE_ENV,
      port: env.APP_PORT,
      globalPrefix: env.APP_GLOBAL_PREFIX,
      version: env.APP_VERSION,
      baseUrl: env.APP_BASE_URL,
      webOrigins: env.WEB_ORIGINS,
      logLevel: env.LOG_LEVEL,
    },
    database: {
      url: env.DATABASE_URL,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
    },
    auth: {
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
      rememberMeExpiresIn: env.JWT_REMEMBER_ME_EXPIRES_IN,
      betterAuthSecret: env.BETTER_AUTH_SECRET,
      betterAuthUrl: env.BETTER_AUTH_URL,
      cookieSecret: env.COOKIE_SECRET,
      mfaIssuer: env.MFA_ISSUER,
      passwordExpiryDays: env.PASSWORD_EXPIRY_DAYS,
      emailVerificationTtlMinutes: env.EMAIL_VERIFICATION_TTL_MINUTES,
      passwordResetTtlMinutes: env.PASSWORD_RESET_TTL_MINUTES,
      magicLinkTtlMinutes: env.MAGIC_LINK_TTL_MINUTES,
      otpTtlMinutes: env.OTP_TTL_MINUTES,
      oauthCallbackBaseUrl: env.OAUTH_CALLBACK_BASE_URL ?? env.APP_BASE_URL,
      googleClientId: env.GOOGLE_CLIENT_ID,
      googleClientSecret: env.GOOGLE_CLIENT_SECRET,
      githubClientId: env.GITHUB_CLIENT_ID,
      githubClientSecret: env.GITHUB_CLIENT_SECRET,
    },
    security: {
      csrfEnabled: env.CSRF_ENABLED,
      rateLimitTtlMs: env.RATE_LIMIT_TTL_MS,
      rateLimitMax: env.RATE_LIMIT_MAX,
      maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
      lockoutWindowMs: env.LOCKOUT_WINDOW_MS,
      lockoutDurationMs: env.LOCKOUT_DURATION_MS,
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    mail: {
      resendApiKey: env.RESEND_API_KEY,
      from: env.MAIL_FROM,
    },
  };
}
