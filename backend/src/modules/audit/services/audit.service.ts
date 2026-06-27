import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { QUEUES } from "../../../common/constants/app.constants";
import { AuditEvent } from "../entities/audit-event.entity";
import { AuditRepository } from "../repositories/audit.repository";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditRepository: AuditRepository,
    @InjectQueue(QUEUES.AUDIT) private readonly auditQueue: Queue<AuditEvent>,
  ) {}

  async record(event: AuditEvent): Promise<void> {
    await this.auditQueue.add("audit.record", event, { jobId: event.requestId ? `audit:${event.requestId}:${event.action}` : undefined });
  }

  async persist(event: AuditEvent): Promise<void> {
    try {
      await this.auditRepository.create(event);
    } catch (error) {
      this.logger.error("Failed to persist audit event.", error instanceof Error ? error.stack : undefined);
    }
  }
}
