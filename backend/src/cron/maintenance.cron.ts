import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class MaintenanceCron {
  private readonly logger = new Logger(MaintenanceCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredAuthRecords(): Promise<void> {
    const now = new Date();
    const [sessions, refreshTokens] = await Promise.all([
      this.prisma.session.updateMany({
        where: { expiresAt: { lt: now }, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.refreshToken.updateMany({
        where: { expiresAt: { lt: now }, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);

    this.logger.log(`Revoked ${sessions.count} expired sessions and ${refreshTokens.count} expired refresh tokens.`);
  }
}
