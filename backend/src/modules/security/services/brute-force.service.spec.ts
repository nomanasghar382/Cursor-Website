import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BruteForceService } from "./brute-force.service";
import { AppCacheService } from "../../../shared/cache/cache.service";

describe("BruteForceService", () => {
  const store = new Map<string, number>();

  const cache = {
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: number) => {
      store.set(key, value);
    }),
    delete: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  } as unknown as AppCacheService;

  const config = {
    getOrThrow: (key: string) => {
      if (key === "security.maxLoginAttempts") return 3;
      if (key === "security.lockoutWindowMs") return 60_000;
      if (key === "security.lockoutDurationMs") return 120_000;
      throw new Error(`Unexpected config key: ${key}`);
    },
  } as ConfigService;

  const service = new BruteForceService(cache, config);

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
  });

  it("locks an account after repeated failed attempts", async () => {
    await service.recordFailedAttempt("user@novaex.ai");
    await service.recordFailedAttempt("user@novaex.ai");
    await expect(service.assertNotLocked("user@novaex.ai")).resolves.toBeUndefined();

    await service.recordFailedAttempt("user@novaex.ai");
    await expect(service.assertNotLocked("user@novaex.ai")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("clears lock state after successful unlock", async () => {
    store.set("auth:account-lock:user@novaex.ai", Date.now() + 60_000);
    await service.unlockAccount("user@novaex.ai");
    await expect(service.assertNotLocked("user@novaex.ai")).resolves.toBeUndefined();
  });
});
