import { UnauthorizedException } from "@nestjs/common";
import { PasswordService } from "./password.service";

describe("PasswordService", () => {
  const service = new PasswordService();

  it("hashes and verifies passwords with argon2id", async () => {
    const hash = await service.hashPassword("Novaex!Secure123");
    expect(hash.startsWith("$argon2")).toBe(true);
    await expect(service.verifyPassword("Novaex!Secure123", hash)).resolves.toBe(true);
    await expect(service.verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("rejects reused passwords from history", async () => {
    const hash = await service.hashPassword("Novaex!Secure123");
    await expect(service.assertNotReused("Novaex!Secure123", [hash])).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("tracks password history with a maximum of five entries", () => {
    const history = service.buildPasswordHistory("hash-1", ["hash-2", "hash-3", "hash-4", "hash-5", "hash-6"]);
    expect(history).toEqual(["hash-1", "hash-2", "hash-3", "hash-4", "hash-5"]);
  });

  it("detects expired passwords", () => {
    const expiredAt = new Date(Date.now() - 60_000).toISOString();
    expect(service.isPasswordExpired(expiredAt)).toBe(true);
    expect(service.isPasswordExpired(new Date(Date.now() + 86_400_000).toISOString())).toBe(false);
  });
});
