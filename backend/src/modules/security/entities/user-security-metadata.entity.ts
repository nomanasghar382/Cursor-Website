import { Prisma } from "@prisma/client";

export interface TrustedDeviceRecord {
  deviceId: string;
  fingerprint: string;
  label: string;
  trustedAt: string;
  lastSeenAt: string;
  ipAddress?: string;
}

export interface UserSecurityMetadata {
  passwordHistory?: string[];
  passwordChangedAt?: string;
  passwordExpiresAt?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  trustedDevices?: TrustedDeviceRecord[];
  securityNotificationsEnabled?: boolean;
  lastPasswordResetAt?: string;
}

export function parseUserSecurityMetadata(metadata: unknown): UserSecurityMetadata {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }
  const root = metadata as Record<string, unknown>;
  const security = root.security;
  if (!security || typeof security !== "object") {
    return {};
  }
  return security as UserSecurityMetadata;
}

export function mergeUserSecurityMetadata(metadata: unknown, security: UserSecurityMetadata): Prisma.InputJsonObject {
  const root = metadata && typeof metadata === "object" ? { ...(metadata as Record<string, unknown>) } : {};
  return { ...root, security: { ...parseUserSecurityMetadata(metadata), ...security } } as unknown as Prisma.InputJsonObject;
}
