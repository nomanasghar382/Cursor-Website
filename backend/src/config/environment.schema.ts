import { z } from "zod";

const csv = z
  .string()
  .min(1)
  .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean));

export const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("NOVAEX API"),
  APP_PORT: z.preprocess(
    (value) => {
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
      return process.env.PORT ?? 4000;
    },
    z.coerce.number().int().positive(),
  ),
  APP_GLOBAL_PREFIX: z.string().default("api"),
  APP_VERSION: z.string().default("v1"),
  APP_BASE_URL: z.string().url().default("http://localhost:4000"),
  WEB_ORIGINS: csv.default(["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  JWT_REMEMBER_ME_EXPIRES_IN: z.string().default("90d"),
  COOKIE_SECRET: z.string().min(24),
  CSRF_ENABLED: z.coerce.boolean().default(false),
  BETTER_AUTH_SECRET: z.string().min(24),
  BETTER_AUTH_URL: z.string().url(),
  MFA_ISSUER: z.string().default("NOVAEX"),
  PASSWORD_EXPIRY_DAYS: z.coerce.number().int().positive().default(90),
  EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  MAGIC_LINK_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOCKOUT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  LOCKOUT_DURATION_MS: z.coerce.number().int().positive().default(1800000),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OAUTH_CALLBACK_BASE_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  ENABLE_TEST_PAYMENT_SIMULATION: z.coerce.boolean().default(false),
  RESEND_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  RATE_LIMIT_TTL_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  LOG_LEVEL: z.enum(["error", "warn", "log", "debug", "verbose", "info"]).default("info"),
});

export type EnvironmentVariables = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const parsed = environmentSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Environment validation failed: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  return parsed.data;
}
