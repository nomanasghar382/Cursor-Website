import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { randomInt, randomUUID } from "node:crypto";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { generateSecureToken } from "../../../common/utils/crypto.util";
import { AuditService } from "../../audit/services/audit.service";
import { EmailTemplateService } from "../../../emails/email-template.service";
import { MailService } from "../../mail/services/mail.service";
import { SessionRepository } from "../../session/repositories/session.repository";
import { AuthTokenStoreService } from "../../security/services/auth-token-store.service";
import { BruteForceService } from "../../security/services/brute-force.service";
import { CookieAuthService } from "../../security/services/cookie-auth.service";
import { DeviceFingerprintService } from "../../security/services/device-fingerprint.service";
import { MfaService } from "../../security/services/mfa.service";
import { PasswordService } from "../../security/services/password.service";
import { SecurityLogService } from "../../security/services/security-log.service";
import { SuspiciousLoginService } from "../../security/services/suspicious-login.service";
import { TokenService } from "../../security/services/token.service";
import { mergeUserSecurityMetadata, parseUserSecurityMetadata } from "../../security/entities/user-security-metadata.entity";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ChangeEmailDto, UpdateProfileDto } from "../dto/profile.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { LoginDto } from "../dto/login.dto";
import { MagicLinkRequestDto, MagicLinkVerifyDto } from "../dto/magic-link.dto";
import { DisableMfaDto, SecuritySettingsDto, VerifyMfaDto } from "../dto/mfa.dto";
import { OtpRequestDto, OtpVerifyDto } from "../dto/otp.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { RegisterDto } from "../dto/register.dto";
import { ResendVerificationDto } from "../dto/resend-verification.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { UnlockAccountDto } from "../dto/unlock-account.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { AuthRepository } from "../repositories/auth.repository";

type UserWithRbac = NonNullable<Awaited<ReturnType<AuthRepository["findUserByEmail"]>>>;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly bruteForceService: BruteForceService,
    private readonly authTokenStore: AuthTokenStoreService,
    private readonly mfaService: MfaService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
    private readonly suspiciousLoginService: SuspiciousLoginService,
    private readonly securityLogService: SecurityLogService,
    private readonly cookieAuthService: CookieAuthService,
    private readonly mailService: MailService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, context: AuthRequestContext) {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email is already registered.");
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const user = await this.authRepository.createCustomer({
      ...dto,
      passwordHash,
      metadata: mergeUserSecurityMetadata(null, {
        passwordHistory: [passwordHash],
        passwordChangedAt: new Date().toISOString(),
        passwordExpiresAt: this.passwordExpiryDate().toISOString(),
        securityNotificationsEnabled: true,
      }),
    });
    await this.authRepository.attachRole(user.id, "customer");
    await this.sendEmailVerification(user.email, context);
    await this.auditService.record({
      actorUserId: user.id,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      ipAddress: context.ipAddress,
      requestId: context.requestId,
      after: { email: user.email, status: user.status },
    });
    return { message: "Registration successful. Verify your email to activate the account.", email: user.email };
  }

  async verifyEmail(dto: VerifyEmailDto, context: AuthRequestContext) {
    const valid = await this.authTokenStore.consumePurposeToken("verify-email", dto.email, dto.token);
    if (!valid) {
      throw new UnauthorizedException("Verification token is invalid or expired.");
    }
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    await this.authRepository.updateUser(user.id, {
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    });
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.email_verified",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "Email verified successfully." };
  }

  async resendVerification(dto: ResendVerificationDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user || user.emailVerifiedAt) {
      return { message: "If the account exists, a verification email has been sent." };
    }
    await this.sendEmailVerification(user.email, context);
    return { message: "If the account exists, a verification email has been sent." };
  }

  async login(dto: LoginDto, context: AuthRequestContext, response: Response) {
    await this.bruteForceService.assertNotLocked(dto.email);
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user?.passwordHash) {
      await this.bruteForceService.recordFailedAttempt(dto.email);
      throw new UnauthorizedException("Invalid credentials.");
    }

    if (user.status === "BLOCKED" || user.status === "DELETED") {
      throw new ForbiddenException("Account is not allowed to sign in.");
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException("Email verification is required before login.");
    }

    const validPassword = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!validPassword) {
      await this.bruteForceService.recordFailedAttempt(dto.email);
      await this.securityLogService.record({
        userId: user.id,
        eventType: "auth.login_failed",
        riskScore: 60,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedException("Invalid credentials.");
    }

    const security = parseUserSecurityMetadata(user.metadata);
    if (this.passwordService.isPasswordExpired(security.passwordExpiresAt)) {
      throw new ForbiddenException("Password has expired. Reset your password to continue.");
    }

    this.assertAudience(user, dto.audience);

    if (security.mfaEnabled) {
      if (!dto.mfaCode) {
        return { mfaRequired: true, methods: ["totp", "backup_code"] };
      }
      const mfaValid =
        (security.mfaSecret && this.mfaService.verifyTotp(dto.mfaCode, security.mfaSecret)) ||
        (security.mfaBackupCodes && this.mfaService.verifyBackupCode(dto.mfaCode, security.mfaBackupCodes));
      if (!mfaValid) {
        throw new UnauthorizedException("Invalid MFA code.");
      }
    }

    const trusted = this.deviceFingerprintService.isTrustedDevice(context.deviceFingerprint, security.trustedDevices);
    await this.suspiciousLoginService.evaluate(user.id, context, trusted, user.lastLoginAt);

    if (dto.trustDevice) {
      const trustedDevices = this.deviceFingerprintService.upsertTrustedDevice(security.trustedDevices, context);
      await this.authRepository.updateUser(user.id, {
        metadata: mergeUserSecurityMetadata(user.metadata, { trustedDevices }),
      });
    }

    await this.bruteForceService.clearAttempts(dto.email);
    const session = await this.issueSession(user, context, response, dto.rememberMe ?? false);
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.login_success",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { audience: dto.audience ?? "customer", rememberMe: dto.rememberMe ?? false },
    });
    return session;
  }

  async logout(userId: string, refreshToken: string | undefined, response: Response, context: AuthRequestContext) {
    if (refreshToken) {
      await this.authRepository.revokeRefreshToken(this.authRepository.hashToken(refreshToken));
    } else {
      await this.authRepository.revokeAllRefreshTokens(userId);
    }
    await this.sessionRepository.revokeAllSessions(userId);
    this.cookieAuthService.clearAuthCookies(response);
    await this.securityLogService.record({
      userId,
      eventType: "auth.logout",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "Logged out successfully." };
  }

  async refresh(dto: RefreshTokenDto, refreshCookie: string | undefined, context: AuthRequestContext, response: Response) {
    const refreshToken = dto.refreshToken ?? refreshCookie;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required.");
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (payload.tokenType !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    if (await this.authTokenStore.isRefreshFamilyBlocked(payload.familyId)) {
      throw new UnauthorizedException("Refresh token family has been revoked.");
    }

    const tokenHash = this.authRepository.hashToken(refreshToken);
    const stored = await this.authRepository.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      await this.authTokenStore.blockRefreshFamily(payload.familyId, 86_400);
      await this.authRepository.revokeRefreshFamily(payload.familyId);
      throw new UnauthorizedException("Refresh token reuse detected.");
    }

    const user = await this.authRepository.findUserById(payload.sub);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("User is not active.");
    }

    const rotated = await this.tokenService.signRefreshToken(user.id, payload.familyId, payload.rememberMe ?? false);
    await this.authRepository.rotateRefreshToken(tokenHash, {
      userId: user.id,
      tokenHash: this.authRepository.hashToken(rotated.token),
      familyId: payload.familyId,
      expiresAt: this.tokenService.getRefreshExpiryDate(payload.rememberMe ?? false),
    });

    const accessToken = await this.tokenService.signAccessToken(this.toClaims(user));
    this.cookieAuthService.setAuthCookies(response, accessToken, rotated.token, payload.rememberMe ?? false);
    return { accessToken, refreshToken: rotated.token, token: accessToken };
  }

  async forgotPassword(dto: ForgotPasswordDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      return { message: "If the account exists, password reset instructions have been sent." };
    }
    const token = await this.authTokenStore.storePurposeToken(
      "reset-password",
      dto.email,
      this.configService.getOrThrow<number>("auth.passwordResetTtlMinutes") * 60,
    );
    const resetUrl = `${this.configService.getOrThrow<string>("app.baseUrl")}/reset-password?email=${encodeURIComponent(dto.email)}&token=${token}`;
    await this.mailService.sendEmail({
      to: dto.email,
      subject: "Reset your NOVAEX password",
      html: this.emailTemplateService.renderTransactional({
        title: "Password reset request",
        body: "Use the secure link below to reset your password.",
        ctaLabel: "Reset password",
        ctaUrl: resetUrl,
      }),
    });
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.password_reset_requested",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "If the account exists, password reset instructions have been sent." };
  }

  async resetPassword(dto: ResetPasswordDto, context: AuthRequestContext) {
    const valid = await this.authTokenStore.consumePurposeToken("reset-password", dto.email, dto.token);
    if (!valid) {
      throw new UnauthorizedException("Reset token is invalid or expired.");
    }
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    await this.applyPasswordChange(user, dto.newPassword);
    await this.authRepository.revokeAllRefreshTokens(user.id);
    await this.sessionRepository.revokeAllSessions(user.id);
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.password_reset_completed",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "Password reset successfully." };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserById(userId);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("User not found.");
    }
    const valid = await this.passwordService.verifyPassword(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Current password is incorrect.");
    }
    await this.applyPasswordChange(user, dto.newPassword);
    await this.authRepository.revokeAllRefreshTokens(user.id);
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.password_changed",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "Password changed successfully." };
  }

  async setupMfa(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    const secret = this.mfaService.generateSecret();
    const backupCodes = this.mfaService.generateBackupCodes();
    await this.authRepository.updateUser(user.id, {
      metadata: mergeUserSecurityMetadata(user.metadata, {
        mfaSecret: secret,
        mfaBackupCodes: this.mfaService.hashBackupCodes(backupCodes),
        mfaEnabled: false,
      }),
    });
    return {
      secret,
      otpAuthUrl: this.mfaService.buildOtpAuthUrl(user.email, secret),
      backupCodes,
    };
  }

  async enableMfa(userId: string, dto: VerifyMfaDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    const security = parseUserSecurityMetadata(user.metadata);
    if (!security.mfaSecret || !this.mfaService.verifyTotp(dto.mfaCode, security.mfaSecret)) {
      throw new UnauthorizedException("Invalid MFA setup code.");
    }
    await this.authRepository.updateUser(user.id, {
      metadata: mergeUserSecurityMetadata(user.metadata, { mfaEnabled: true }),
    });
    await this.securityLogService.record({
      userId,
      eventType: "auth.mfa_enabled",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { enabled: true };
  }

  async disableMfa(userId: string, dto: DisableMfaDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    const security = parseUserSecurityMetadata(user.metadata);
    const valid =
      (security.mfaSecret && this.mfaService.verifyTotp(dto.mfaCode, security.mfaSecret)) ||
      (dto.backupCode && security.mfaBackupCodes && this.mfaService.verifyBackupCode(dto.backupCode, security.mfaBackupCodes));
    if (!valid) {
      throw new UnauthorizedException("Invalid MFA code.");
    }
    await this.authRepository.updateUser(user.id, {
      metadata: mergeUserSecurityMetadata(user.metadata, { mfaEnabled: false, mfaSecret: undefined, mfaBackupCodes: [] }),
    });
    await this.securityLogService.record({
      userId,
      eventType: "auth.mfa_disabled",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { enabled: false };
  }

  async requestMagicLink(dto: MagicLinkRequestDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      return { message: "If the account exists, a magic link has been sent." };
    }
    const token = await this.authTokenStore.storePurposeToken(
      "magic-link",
      dto.email,
      this.configService.getOrThrow<number>("auth.magicLinkTtlMinutes") * 60,
    );
    const magicUrl = `${this.configService.getOrThrow<string>("app.baseUrl")}/magic-login?email=${encodeURIComponent(dto.email)}&token=${token}`;
    await this.mailService.sendEmail({
      to: dto.email,
      subject: "Your NOVAEX magic sign-in link",
      html: this.emailTemplateService.renderTransactional({
        title: "Magic sign-in link",
        body: "Use this one-time secure link to sign in.",
        ctaLabel: "Sign in",
        ctaUrl: magicUrl,
      }),
    });
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.magic_link_requested",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return { message: "If the account exists, a magic link has been sent." };
  }

  async verifyMagicLink(dto: MagicLinkVerifyDto, context: AuthRequestContext, response: Response) {
    const valid = await this.authTokenStore.consumePurposeToken("magic-link", dto.email, dto.token);
    if (!valid) {
      throw new UnauthorizedException("Magic link is invalid or expired.");
    }
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Account is not active.");
    }
    return this.issueSession(user, context, response, false);
  }

  async requestOtp(dto: OtpRequestDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      return { message: "If the account exists, an OTP has been sent." };
    }
    const code = String(randomInt(100000, 999999));
    await this.authTokenStore.storeOtp(dto.purpose, dto.email, code, this.configService.getOrThrow<number>("auth.otpTtlMinutes") * 60);
    await this.mailService.sendEmail({
      to: dto.email,
      subject: "Your NOVAEX verification code",
      html: this.emailTemplateService.renderTransactional({
        title: "Verification code",
        body: `Your one-time verification code is ${code}. It expires in ${this.configService.getOrThrow<number>("auth.otpTtlMinutes")} minutes.`,
      }),
    });
    await this.securityLogService.record({
      userId: user.id,
      eventType: "auth.otp_requested",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { purpose: dto.purpose },
    });
    return { message: "If the account exists, an OTP has been sent." };
  }

  async verifyOtp(dto: OtpVerifyDto, context: AuthRequestContext, response: Response) {
    const valid = await this.authTokenStore.consumeOtp(dto.purpose, dto.email, dto.code);
    if (!valid) {
      throw new UnauthorizedException("OTP is invalid or expired.");
    }
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    if (dto.purpose === "verify-email") {
      await this.authRepository.updateUser(user.id, { status: "ACTIVE", emailVerifiedAt: new Date() });
      return { message: "Email verified successfully." };
    }

    if (dto.purpose === "login") {
      return this.issueSession(user, context, response, false);
    }

    return { message: "OTP verified successfully." };
  }

  me(userId: string) {
    return this.authRepository.findUserById(userId).then((user) => {
      if (!user) {
        throw new UnauthorizedException("User not found.");
      }
      return { user: this.toSafeUser(user) };
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.authRepository.updateProfile(userId, dto);
    return this.me(userId);
  }

  async changeEmail(userId: string, dto: ChangeEmailDto, context: AuthRequestContext) {
    const user = await this.authRepository.findUserById(userId);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("User not found.");
    }
    const valid = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Password is incorrect.");
    }
    const conflict = await this.authRepository.findUserByEmail(dto.newEmail);
    if (conflict) {
      throw new ConflictException("Email is already in use.");
    }
    await this.authRepository.updateUser(user.id, {
      email: dto.newEmail,
      emailVerifiedAt: null,
      status: "PENDING",
    });
    await this.sendEmailVerification(dto.newEmail, context);
    return { message: "Email change initiated. Verify the new email to complete the update." };
  }

  async getSecuritySettings(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    const security = parseUserSecurityMetadata(user.metadata);
    return {
      mfaEnabled: security.mfaEnabled ?? false,
      securityNotificationsEnabled: security.securityNotificationsEnabled ?? true,
      trustedDevices: security.trustedDevices ?? [],
      passwordExpiresAt: security.passwordExpiresAt,
    };
  }

  async updateSecuritySettings(userId: string, dto: SecuritySettingsDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }
    await this.authRepository.updateUser(user.id, {
      metadata: mergeUserSecurityMetadata(user.metadata, {
        securityNotificationsEnabled: dto.securityNotificationsEnabled,
      }),
    });
    return this.getSecuritySettings(userId);
  }

  async getSecurityDashboard(userId: string) {
    const [settings, loginHistory] = await Promise.all([
      this.getSecuritySettings(userId),
      this.securityLogService.listForUser(userId, 25),
    ]);
    return { settings, loginHistory };
  }

  async unlockAccount(dto: UnlockAccountDto, actorUserId: string, context: AuthRequestContext) {
    await this.bruteForceService.unlockAccount(dto.email);
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (user?.status === "BLOCKED") {
      await this.authRepository.updateUser(user.id, { status: "ACTIVE" });
    }
    await this.auditService.record({
      actorUserId,
      action: "auth.account_unlocked",
      entityType: "user",
      entityId: user?.id,
      ipAddress: context.ipAddress,
      requestId: context.requestId,
      after: { email: dto.email },
    });
    return { unlocked: true };
  }

  async demo(context: AuthRequestContext, response: Response) {
    if (this.configService.get<string>("app.nodeEnv") === "production") {
      throw new ForbiddenException("Demo login is disabled in production.");
    }
    const user = await this.authRepository.findUserByEmail("admin@novaex.ai");
    if (!user) {
      throw new UnauthorizedException("Demo admin is not seeded.");
    }
    return this.issueSession(user, context, response, false);
  }

  async establishAuthenticatedSession(user: UserWithRbac, context: AuthRequestContext, response: Response, rememberMe = false) {
    return this.issueSession(user, context, response, rememberMe);
  }

  getOAuthProviders() {
    return {
      google: {
        enabled: Boolean(this.configService.get<string>("auth.googleClientId")),
        callback: `${this.configService.getOrThrow<string>("auth.oauthCallbackBaseUrl")}/api/auth/oauth/google/callback`,
      },
      github: {
        enabled: Boolean(this.configService.get<string>("auth.githubClientId")),
        callback: `${this.configService.getOrThrow<string>("auth.oauthCallbackBaseUrl")}/api/auth/oauth/github/callback`,
      },
      apple: {
        enabled: false,
        architectureReady: true,
        notes: "Configure Apple Sign In service ID, team ID, key ID, and private key in deployment secrets.",
      },
      facebook: {
        enabled: false,
        architectureReady: true,
        notes: "Configure Facebook app ID and secret, then enable OAuth callback route in production rollout.",
      },
    };
  }

  private async issueSession(user: UserWithRbac, context: AuthRequestContext, response: Response, rememberMe: boolean) {
    const claims = this.toClaims(user);
    const accessToken = await this.tokenService.signAccessToken(claims);
    const refresh = await this.tokenService.signRefreshToken(user.id, randomUUID(), rememberMe);
    const sessionToken = generateSecureToken();

    await Promise.all([
      this.authRepository.createRefreshToken({
        userId: user.id,
        tokenHash: this.authRepository.hashToken(refresh.token),
        familyId: refresh.familyId,
        expiresAt: this.tokenService.getRefreshExpiryDate(rememberMe),
      }),
      this.sessionRepository.createSession({
        userId: user.id,
        sessionToken,
        context,
        expiresAt: this.tokenService.getRefreshExpiryDate(rememberMe),
      }),
      this.authRepository.updateUser(user.id, { lastLoginAt: new Date() }),
    ]);

    this.cookieAuthService.setAuthCookies(response, accessToken, refresh.token, rememberMe);
    return {
      token: accessToken,
      accessToken,
      refreshToken: refresh.token,
      user: this.toSafeUser(user),
    };
  }

  private async applyPasswordChange(user: UserWithRbac, newPassword: string) {
    const security = parseUserSecurityMetadata(user.metadata);
    await this.passwordService.assertNotReused(newPassword, security.passwordHistory ?? []);
    const passwordHash = await this.passwordService.hashPassword(newPassword);
    await this.authRepository.updateUser(user.id, {
      passwordHash,
      metadata: mergeUserSecurityMetadata(user.metadata, {
        passwordHistory: this.passwordService.buildPasswordHistory(passwordHash, security.passwordHistory),
        passwordChangedAt: new Date().toISOString(),
        passwordExpiresAt: this.passwordExpiryDate().toISOString(),
      }),
    });
  }

  private async sendEmailVerification(email: string, context: AuthRequestContext) {
    const token = await this.authTokenStore.storePurposeToken(
      "verify-email",
      email,
      this.configService.getOrThrow<number>("auth.emailVerificationTtlMinutes") * 60,
    );
    const verifyUrl = `${this.configService.getOrThrow<string>("app.baseUrl")}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    await this.mailService.sendEmail({
      to: email,
      subject: "Verify your NOVAEX account",
      html: this.emailTemplateService.renderTransactional({
        title: "Verify your email",
        body: "Confirm your email address to activate your NOVAEX account.",
        ctaLabel: "Verify email",
        ctaUrl: verifyUrl,
      }),
    });
    await this.securityLogService.record({
      eventType: "auth.verification_email_sent",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { email },
    });
  }

  private passwordExpiryDate(): Date {
    const days = this.configService.getOrThrow<number>("auth.passwordExpiryDays");
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private assertAudience(user: UserWithRbac, audience?: LoginDto["audience"]) {
    if (!audience || audience === "customer") {
      return;
    }
    const roles = new Set(user.roles.map((entry) => entry.role.slug));
    if (audience === "vendor" && !roles.has("vendor-admin") && !roles.has("seller") && !roles.has("seller-admin")) {
      throw new ForbiddenException("Vendor access is not granted for this account.");
    }
    if (audience === "admin" && !roles.has("admin") && !roles.has("super-admin")) {
      throw new ForbiddenException("Admin access is not granted for this account.");
    }
    if (audience === "super-admin" && !roles.has("super-admin")) {
      throw new ForbiddenException("Super admin access is not granted for this account.");
    }
  }

  private toClaims(user: UserWithRbac) {
    const roles = user.roles.map((userRole) => userRole.role.slug);
    const permissions = Array.from(
      new Set(user.roles.flatMap((userRole) => userRole.role.rolePermissions.map((entry) => `${entry.permission.resource}:${entry.permission.action}`))),
    );
    return {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
      vendorIds: user.roles.flatMap((role) => (role.vendorId ? [role.vendorId] : [])),
      storeIds: user.roles.flatMap((role) => (role.storeId ? [role.storeId] : [])),
    };
  }

  private toSafeUser(user: UserWithRbac) {
    return {
      id: user.id,
      email: user.email,
      role: user.roles[0]?.role.slug ?? "customer",
      roles: user.roles.map((userRole) => userRole.role.slug),
      permissions: this.toClaims(user).permissions,
      name: [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") || user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      status: user.status,
    };
  }
}
