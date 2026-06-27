import { Module } from "@nestjs/common";
import { QueueModule } from "../../queues/queue.module";
import { AuditProcessor } from "./queues/audit.processor";
import { AuditRepository } from "./repositories/audit.repository";
import { AuditService } from "./services/audit.service";

@Module({
  imports: [QueueModule],
  providers: [AuditService, AuditRepository, AuditProcessor],
  exports: [AuditService],
})
export class AuditModule {}
