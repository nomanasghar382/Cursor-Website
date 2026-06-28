import { Injectable } from "@nestjs/common";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { TrustedDeviceRecord } from "../entities/user-security-metadata.entity";

@Injectable()
export class DeviceFingerprintService {
  isTrustedDevice(fingerprint: string, trustedDevices: TrustedDeviceRecord[] = []): boolean {
    return trustedDevices.some((device) => device.fingerprint === fingerprint);
  }

  upsertTrustedDevice(
    trustedDevices: TrustedDeviceRecord[] = [],
    context: AuthRequestContext,
    label = "Trusted device",
  ): TrustedDeviceRecord[] {
    const now = new Date().toISOString();
    const existing = trustedDevices.find((device) => device.fingerprint === context.deviceFingerprint);
    if (existing) {
      return trustedDevices.map((device) =>
        device.fingerprint === context.deviceFingerprint
          ? { ...device, lastSeenAt: now, ipAddress: context.ipAddress }
          : device,
      );
    }

    return [
      {
        deviceId: context.deviceId ?? context.deviceFingerprint.slice(0, 16),
        fingerprint: context.deviceFingerprint,
        label,
        trustedAt: now,
        lastSeenAt: now,
        ipAddress: context.ipAddress,
      },
      ...trustedDevices,
    ].slice(0, 20);
  }
}
