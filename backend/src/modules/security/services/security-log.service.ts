import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

export interface SecurityLogInput {
  userId?: string;
  eventType: string;
  riskScore?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SecurityLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: SecurityLogInput) {
    return this.prisma.securityLog.create({
      data: {
        userId: input.userId,
        eventType: input.eventType,
        riskScore: input.riskScore ?? 0,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  }

  listForUser(userId: string, limit = 50) {
    return this.prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
