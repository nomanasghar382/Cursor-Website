export interface AuditEvent {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  requestId?: string;
  ipAddress?: string;
  changes?: Record<string, unknown>;
}
