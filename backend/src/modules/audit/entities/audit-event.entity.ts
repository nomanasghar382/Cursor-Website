export interface AuditEvent {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  requestId?: string;
  ipAddress?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}
