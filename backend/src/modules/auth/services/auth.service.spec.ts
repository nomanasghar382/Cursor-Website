import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionRepository } from "../../session/repositories/session.repository";
import { PasswordService } from "../../security/services/password.service";
import { TokenService } from "../../security/services/token.service";
import { BruteForceService } from "../../security/services/brute-force.service";
import { AuthTokenStoreService } from "../../security/services/auth-token-store.service";
import { MfaService } from "../../security/services/mfa.service";
import { DeviceFingerprintService } from "../../security/services/device-fingerprint.service";
import { SuspiciousLoginService } from "../../security/services/suspicious-login.service";
import { SecurityLogService } from "../../security/services/security-log.service";
import { CookieAuthService } from "../../security/services/cookie-auth.service";
import { MailService } from "../../mail/services/mail.service";
import { EmailTemplateService } from "../../../emails/email-template.service";
import { AuditService } from "../../audit/services/audit.service";

describe("AuthService", () => {
  const response = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
  const context = {
    ipAddress: "127.0.0.1",
    userAgent: "jest",
    deviceId: "device-1",
    deviceFingerprint: "fp-1",
    requestId: "req-1",
  };

  const authRepository = {
    findUserByEmail: jest.fn(),
    createCustomer: jest.fn(),
    attachRole: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    hashToken: jest.fn((value: string) => `hash:${value}`),
    findRefreshTokenByHash: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeRefreshFamily: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
    createRefreshToken: jest.fn(),
  } as unknown as AuthRepository;

  const sessionRepository = {
    createSession: jest.fn(),
    revokeAllSessions: jest.fn(),
  } as unknown as SessionRepository;

  const passwordService = new PasswordService();
  const tokenService = {
    signAccessToken: jest.fn().mockResolvedValue("access-token"),
    signRefreshToken: jest.fn().mockResolvedValue({ token: "refresh-token", familyId: "family-1" }),
    verifyRefreshToken: jest.fn(),
    getRefreshExpiryDate: jest.fn().mockReturnValue(new Date(Date.now() + 86_400_000)),
  } as unknown as TokenService;

  const bruteForceService = {
    assertNotLocked: jest.fn(),
    clearAttempts: jest.fn(),
    recordFailedAttempt: jest.fn(),
    unlockAccount: jest.fn(),
  } as unknown as BruteForceService;

  const authTokenStore = {
    isRefreshFamilyBlocked: jest.fn().mockResolvedValue(false),
    blockRefreshFamily: jest.fn(),
    storePurposeToken: jest.fn().mockResolvedValue("verification-token"),
    consumePurposeToken: jest.fn(),
  } as unknown as AuthTokenStoreService;

  const mfaService = {
    verifyTotp: jest.fn(),
    verifyBackupCode: jest.fn(),
    generateSecret: jest.fn(),
    buildOtpAuthUrl: jest.fn(),
    generateBackupCodes: jest.fn(),
    hashBackupCodes: jest.fn(),
  } as unknown as MfaService;

  const deviceFingerprintService = {
    isTrustedDevice: jest.fn().mockReturnValue(true),
    upsertTrustedDevice: jest.fn(),
  } as unknown as DeviceFingerprintService;

  const suspiciousLoginService = {
    evaluate: jest.fn(),
  } as unknown as SuspiciousLoginService;

  const securityLogService = {
    record: jest.fn(),
  } as unknown as SecurityLogService;

  const cookieAuthService = {
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  } as unknown as CookieAuthService;

  const mailService = { sendEmail: jest.fn() } as unknown as MailService;
  const emailTemplateService = { renderTransactional: jest.fn().mockReturnValue("<p>verify</p>") } as unknown as EmailTemplateService;
  const auditService = { record: jest.fn() } as unknown as AuditService;

  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string | number> = {
        "auth.emailVerificationTtlMinutes": 60,
        "auth.passwordExpiryDays": 90,
        "auth.oauthCallbackBaseUrl": "http://localhost:4000",
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  const service = new AuthService(
    authRepository,
    sessionRepository,
    passwordService,
    tokenService,
    bruteForceService,
    authTokenStore,
    mfaService,
    deviceFingerprintService,
    suspiciousLoginService,
    securityLogService,
    cookieAuthService,
    mailService,
    emailTemplateService,
    auditService,
    configService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new customer and sends verification email", async () => {
    (authRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.createCustomer as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "user@novaex.ai",
      status: "PENDING",
    });

    const result = await service.register(
      {
        email: "user@novaex.ai",
        password: "Novaex!Secure123",
        firstName: "Nova",
        lastName: "User",
      },
      context,
    );

    expect(result.email).toBe("user@novaex.ai");
    expect(authRepository.attachRole).toHaveBeenCalledWith("user-1", "customer");
    expect(mailService.sendEmail).toHaveBeenCalled();
  });

  it("rejects duplicate registrations", async () => {
    (authRepository.findUserByEmail as jest.Mock).mockResolvedValue({ id: "existing" });
    await expect(
      service.register(
        {
          email: "user@novaex.ai",
          password: "Novaex!Secure123",
          firstName: "Nova",
          lastName: "User",
        },
        context,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects login for invalid credentials", async () => {
    (authRepository.findUserByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "user@novaex.ai",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      passwordHash: await passwordService.hashPassword("correct-password"),
      metadata: {},
      roles: [{ role: { slug: "customer", rolePermissions: [] } }],
    });

    await expect(
      service.login(
        { email: "user@novaex.ai", password: "wrong-password", audience: "customer" },
        context,
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(bruteForceService.recordFailedAttempt).toHaveBeenCalledWith("user@novaex.ai");
  });

  it("detects refresh token reuse and revokes the family", async () => {
    (tokenService.verifyRefreshToken as jest.Mock).mockResolvedValue({
      sub: "user-1",
      familyId: "family-1",
      tokenType: "refresh",
      rememberMe: false,
    });
    (authRepository.findRefreshTokenByHash as jest.Mock).mockResolvedValue(null);

    await expect(service.refresh({ refreshToken: "stolen-token" }, undefined, context, response)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(authTokenStore.blockRefreshFamily).toHaveBeenCalledWith("family-1", 86_400);
    expect(authRepository.revokeRefreshFamily).toHaveBeenCalledWith("family-1");
  });
});
