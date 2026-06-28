export interface AuthRequestContext {
  ipAddress: string;
  userAgent?: string;
  deviceId?: string;
  deviceFingerprint: string;
  requestId?: string;
}
