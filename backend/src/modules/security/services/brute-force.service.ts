import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppCacheService } from "../../../shared/cache/cache.service";

@Injectable()
export class BruteForceService {
  constructor(
    private readonly cache: AppCacheService,
    private readonly configService: ConfigService,
  ) {}

  async assertNotLocked(email: string): Promise<void> {
    const lockKey = this.lockKey(email);
    const lockedUntil = await this.cache.get<number>(lockKey);
    if (lockedUntil && lockedUntil > Date.now()) {
      throw new UnauthorizedException("Account is temporarily locked due to failed login attempts.");
    }
  }

  async recordFailedAttempt(email: string): Promise<void> {
    const attemptsKey = this.attemptsKey(email);
    const current = (await this.cache.get<number>(attemptsKey)) ?? 0;
    const next = current + 1;
    const ttl = Math.ceil(this.configService.getOrThrow<number>("security.lockoutWindowMs") / 1000);
    await this.cache.set(attemptsKey, next, ttl);

    if (next >= this.configService.getOrThrow<number>("security.maxLoginAttempts")) {
      const lockedUntil = Date.now() + this.configService.getOrThrow<number>("security.lockoutDurationMs");
      await this.cache.set(this.lockKey(email), lockedUntil, Math.ceil(this.configService.getOrThrow<number>("security.lockoutDurationMs") / 1000));
    }
  }

  async clearAttempts(email: string): Promise<void> {
    await this.cache.delete(this.attemptsKey(email));
    await this.cache.delete(this.lockKey(email));
  }

  async unlockAccount(email: string): Promise<void> {
    await this.clearAttempts(email);
  }

  private attemptsKey(email: string): string {
    return `auth:login-attempts:${email.toLowerCase()}`;
  }

  private lockKey(email: string): string {
    return `auth:account-lock:${email.toLowerCase()}`;
  }
}
