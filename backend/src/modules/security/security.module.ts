import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../../common/strategies/jwt.strategy";
import { betterAuthProvider } from "./providers/better-auth.provider";
import { AuthTokenStoreService } from "./services/auth-token-store.service";
import { BruteForceService } from "./services/brute-force.service";
import { CookieAuthService } from "./services/cookie-auth.service";
import { DeviceFingerprintService } from "./services/device-fingerprint.service";
import { MfaService } from "./services/mfa.service";
import { PasswordService } from "./services/password.service";
import { SecurityLogService } from "./services/security-log.service";
import { SuspiciousLoginService } from "./services/suspicious-login.service";
import { TokenService } from "./services/token.service";

@Module({
  imports: [JwtModule.register({}), PassportModule.register({ defaultStrategy: "jwt" })],
  providers: [
    PasswordService,
    TokenService,
    SecurityLogService,
    BruteForceService,
    AuthTokenStoreService,
    MfaService,
    DeviceFingerprintService,
    SuspiciousLoginService,
    CookieAuthService,
    JwtStrategy,
    betterAuthProvider,
  ],
  exports: [
    PasswordService,
    TokenService,
    SecurityLogService,
    BruteForceService,
    AuthTokenStoreService,
    MfaService,
    DeviceFingerprintService,
    SuspiciousLoginService,
    CookieAuthService,
    JwtModule,
    PassportModule,
    betterAuthProvider,
  ],
})
export class SecurityModule {}
