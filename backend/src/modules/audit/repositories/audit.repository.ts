import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { AuditEvent } from "../entities/audit-event.entity";

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(event: AuditEvent) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: event.actorUserId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        ipAddress: event.ipAddress,
        changes: (event.changes ?? {}) as Prisma.InputJsonObject,
        metadata: {
          requestId: event.requestId,
        },
      },
    });
  }
}
