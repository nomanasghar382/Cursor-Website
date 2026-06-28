import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { compare } from "bcryptjs";

@Injectable()
export class PasswordService {
  private readonly maxHistory = 5;

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    if (passwordHash.startsWith("$argon2")) {
      return argon2.verify(passwordHash, password);
    }
    return compare(password, passwordHash);
  }

  async assertNotReused(password: string, history: string[] = []): Promise<void> {
    for (const previousHash of history) {
      const reused = await this.verifyPassword(password, previousHash);
      if (reused) {
        throw new UnauthorizedException("Password was used recently. Choose a different password.");
      }
    }
  }

  buildPasswordHistory(currentHash: string, history: string[] = []): string[] {
    return [currentHash, ...history].slice(0, this.maxHistory);
  }

  isPasswordExpired(passwordExpiresAt?: string): boolean {
    if (!passwordExpiresAt) {
      return false;
    }
    return new Date(passwordExpiresAt).getTime() <= Date.now();
  }
}
