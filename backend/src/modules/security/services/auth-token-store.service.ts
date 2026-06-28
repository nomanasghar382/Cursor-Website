import { Injectable } from "@nestjs/common";
import { AppCacheService } from "../../../shared/cache/cache.service";
import { generateSecureToken, hashSecret, secureCompare } from "../../../common/utils/crypto.util";

@Injectable()
export class AuthTokenStoreService {
  constructor(private readonly cache: AppCacheService) {}

  async storePurposeToken(purpose: string, subject: string, ttlSeconds: number): Promise<string> {
    const token = generateSecureToken();
    await this.cache.set(this.key(purpose, subject), hashSecret(token), ttlSeconds);
    return token;
  }

  async verifyPurposeToken(purpose: string, subject: string, token: string): Promise<boolean> {
    const stored = await this.cache.get<string>(this.key(purpose, subject));
    if (!stored) {
      return false;
    }
    return secureCompare(stored, hashSecret(token));
  }

  async consumePurposeToken(purpose: string, subject: string, token: string): Promise<boolean> {
    const valid = await this.verifyPurposeToken(purpose, subject, token);
    if (valid) {
      await this.cache.delete(this.key(purpose, subject));
    }
    return valid;
  }

  async storeOtp(purpose: string, subject: string, code: string, ttlSeconds: number): Promise<void> {
    await this.cache.set(this.key(`otp:${purpose}`, subject), hashSecret(code), ttlSeconds);
  }

  async verifyOtp(purpose: string, subject: string, code: string): Promise<boolean> {
    const stored = await this.cache.get<string>(this.key(`otp:${purpose}`, subject));
    if (!stored) {
      return false;
    }
    return secureCompare(stored, hashSecret(code));
  }

  async consumeOtp(purpose: string, subject: string, code: string): Promise<boolean> {
    const valid = await this.verifyOtp(purpose, subject, code);
    if (valid) {
      await this.cache.delete(this.key(`otp:${purpose}`, subject));
    }
    return valid;
  }

  async blockRefreshFamily(familyId: string, ttlSeconds: number): Promise<void> {
    await this.cache.set(`auth:refresh-replay:${familyId}`, true, ttlSeconds);
  }

  async isRefreshFamilyBlocked(familyId: string): Promise<boolean> {
    return (await this.cache.get<boolean>(`auth:refresh-replay:${familyId}`)) === true;
  }

  private key(purpose: string, subject: string): string {
    return `auth:token:${purpose}:${subject.toLowerCase()}`;
  }
}
