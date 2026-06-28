import { ConfigService } from "@nestjs/config";
import { MfaService } from "./mfa.service";

describe("MfaService", () => {
  const service = new MfaService({
    getOrThrow: () => "NOVAEX",
  } as unknown as ConfigService);

  it("generates secrets and otpauth URLs", () => {
    const secret = service.generateSecret();
    expect(secret.length).toBeGreaterThan(10);
    expect(service.buildOtpAuthUrl("user@novaex.ai", secret)).toContain("otpauth://totp/");
  });

  it("verifies generated TOTP codes", () => {
    const secret = service.generateSecret();
    const token = service.generateCurrentTotp(secret);
    expect(service.verifyTotp(token, secret)).toBe(true);
    expect(service.verifyTotp("000000", secret)).toBe(false);
  });

  it("hashes and verifies backup codes", () => {
    const codes = service.generateBackupCodes(3);
    const hashed = service.hashBackupCodes(codes);
    expect(service.verifyBackupCode(codes[0], hashed)).toBe(true);
    expect(service.verifyBackupCode("INVALID", hashed)).toBe(false);
  });
});
