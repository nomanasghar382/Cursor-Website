import { Injectable, NotFoundException } from "@nestjs/common";
import { SessionRepository } from "../repositories/session.repository";

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  listSessions(userId: string) {
    return this.sessionRepository.listActiveSessions(userId).then((sessions) =>
      sessions.map((session) => ({
        id: session.id,
        deviceId: session.deviceId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        current: false,
      })),
    );
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.sessionRepository.revokeSession(sessionId, userId);
    if (result.count === 0) {
      throw new NotFoundException("Session not found.");
    }
    return { revoked: true };
  }

  revokeAllSessions(userId: string, exceptSessionId?: string) {
    return this.sessionRepository.revokeAllSessions(userId, exceptSessionId).then((result) => ({
      revokedCount: result.count,
    }));
  }
}
