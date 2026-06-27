import { ConfigService } from "@nestjs/config";
import { betterAuth } from "better-auth";

export const BETTER_AUTH = Symbol("BETTER_AUTH");

export const betterAuthProvider = {
  provide: BETTER_AUTH,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    betterAuth({
      secret: configService.getOrThrow<string>("auth.betterAuthSecret"),
      baseURL: configService.getOrThrow<string>("auth.betterAuthUrl"),
      trustedOrigins: configService.getOrThrow<string[]>("app.webOrigins"),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
      advanced: {
        useSecureCookies: configService.get<string>("app.nodeEnv") === "production",
      },
    }),
};
