import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NobleCryptoPlugin,
  ScureBase32Plugin,
  generateSecret,
  generateSync,
  generateURI,
  verifySync,
} from "otplib";
import { generateSecureToken, hashSecret } from "../../../common/utils/crypto.util";

const cryptoPlugin = new NobleCryptoPlugin();
const base32Plugin = new ScureBase32Plugin();

@Injectable()
export class MfaService {
  constructor(private readonly configService: ConfigService) {}

  generateSecret(): string {
    return generateSecret({ crypto: cryptoPlugin, base32: base32Plugin });
  }

  buildOtpAuthUrl(email: string, secret: string): string {
    return generateURI({
      issuer: this.configService.getOrThrow<string>("auth.mfaIssuer"),
      label: email,
      secret,
    });
  }

  verifyTotp(token: string, secret: string): boolean {
    const result = verifySync({
      token,
      secret,
      crypto: cryptoPlugin,
      base32: base32Plugin,
    });
    return result.valid;
  }

  generateCurrentTotp(secret: string): string {
    return generateSync({
      secret,
      crypto: cryptoPlugin,
      base32: base32Plugin,
    });
  }

  generateBackupCodes(count = 8): string[] {
    return Array.from({ length: count }, () => generateSecureToken(5).slice(0, 10).toUpperCase());
  }

  hashBackupCodes(codes: string[]): string[] {
    return codes.map((code) => hashSecret(code));
  }

  verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashed = hashSecret(code.toUpperCase());
    return hashedCodes.includes(hashed);
  }
}
