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
      betterAuthSecret: env.BETTER_AUTH_SECRET,
      betterAuthUrl: env.BETTER_AUTH_URL,
      cookieSecret: env.COOKIE_SECRET,
    },
    security: {
      csrfEnabled: env.CSRF_ENABLED,
      rateLimitTtlMs: env.RATE_LIMIT_TTL_MS,
      rateLimitMax: env.RATE_LIMIT_MAX,
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
