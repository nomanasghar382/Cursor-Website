import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { QUEUES } from "../../../common/constants/app.constants";
import { AuditEvent } from "../entities/audit-event.entity";
import { AuditService } from "../services/audit.service";

@Processor(QUEUES.AUDIT)
export class AuditProcessor extends WorkerHost {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  async process(job: Job<AuditEvent>): Promise<void> {
    await this.auditService.persist(job.data);
  }
}
