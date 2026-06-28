import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { hashSecret } from "../../../common/utils/crypto.util";

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSession(input: { userId: string; sessionToken: string; context: AuthRequestContext; expiresAt: Date }) {
    return this.prisma.session.create({
      data: {
        userId: input.userId,
        sessionTokenHash: hashSecret(input.sessionToken),
        ipAddress: input.context.ipAddress,
        userAgent: input.context.userAgent,
        deviceId: input.context.deviceId,
        expiresAt: input.expiresAt,
      },
    });
  }

  listActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findSessionForUser(sessionId: string, userId: string) {
    return this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
  }

  revokeSession(sessionId: string, userId: string) {
    return this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllSessions(userId: string, exceptSessionId?: string) {
    return this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }
}
