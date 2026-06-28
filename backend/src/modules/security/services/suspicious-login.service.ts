import { Injectable } from "@nestjs/common";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { SecurityLogService } from "./security-log.service";

@Injectable()
export class SuspiciousLoginService {
  constructor(private readonly securityLogService: SecurityLogService) {}

  async evaluate(userId: string, context: AuthRequestContext, trustedFingerprint: boolean, lastLoginAt?: Date | null) {
    let riskScore = 0;
    const reasons: string[] = [];

    if (!trustedFingerprint) {
      riskScore += 35;
      reasons.push("untrusted_device");
    }

    if (lastLoginAt) {
      const hoursSinceLastLogin = (Date.now() - lastLoginAt.getTime()) / 3_600_000;
      if (hoursSinceLastLogin > 24 * 30) {
        riskScore += 20;
        reasons.push("dormant_account");
      }
    }

    if (context.ipAddress.startsWith("10.") || context.ipAddress === "127.0.0.1") {
      riskScore -= 5;
    }

    const suspicious = riskScore >= 40;
    if (suspicious) {
      await this.securityLogService.record({
        userId,
        eventType: "auth.suspicious_login",
        riskScore,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: { reasons, deviceFingerprint: context.deviceFingerprint },
      });
    }

    return { suspicious, riskScore, reasons };
  }
}
