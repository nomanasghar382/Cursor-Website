import { apiRequest } from "@/lib/api/client";
import type { AuthSession, LoginPayload, RegisterPayload, AuthUser } from "@/types/auth";

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<{ message: string; email: string }>("auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login(payload: LoginPayload) {
    return apiRequest<AuthSession & { mfaRequired?: boolean; methods?: string[] }>("auth/login", {
      method: "POST",
      body: payload,
    });
  },

  adminLogin(payload: LoginPayload) {
    return apiRequest<AuthSession & { mfaRequired?: boolean; methods?: string[] }>("auth/super-admin/login", {
      method: "POST",
      body: { ...payload, audience: "super-admin" },
    });
  },

  logout(token: string, refreshToken?: string) {
    return apiRequest<{ message: string }>("auth/logout", {
      method: "POST",
      token,
      body: { refreshToken },
    });
  },

  refresh(refreshToken?: string) {
    return apiRequest<{ accessToken: string; refreshToken: string; token: string }>("auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  me(token: string) {
    return apiRequest<{ user: AuthUser }>("auth/me", { method: "GET", token }).then((result) => result.user);
  },

  forgotPassword(email: string) {
    return apiRequest<{ message: string }>("auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword(payload: { email: string; token: string; password: string }) {
    return apiRequest<{ message: string }>("auth/reset-password", {
      method: "POST",
      body: payload,
    });
  },

  verifyEmail(payload: { email: string; token: string }) {
    return apiRequest<{ message: string }>("auth/verify-email", {
      method: "POST",
      body: payload,
    });
  },

  resendVerification(email: string) {
    return apiRequest<{ message: string }>("auth/resend-verification", {
      method: "POST",
      body: { email },
    });
  },

  oauthProviders() {
    return apiRequest<Record<string, unknown>>("auth/oauth/providers", { method: "GET" });
  },

  updateProfile(token: string, body: { firstName?: string; lastName?: string; phone?: string }) {
    return apiRequest<{ user: AuthUser }>("auth/profile", { method: "PATCH", token, body });
  },

  changePassword(token: string, body: { currentPassword: string; newPassword: string }) {
    return apiRequest<{ message: string }>("auth/change-password", { method: "PATCH", token, body });
  },

  securityDashboard(token: string) {
    return apiRequest<{
      settings: { mfaEnabled: boolean; securityNotificationsEnabled: boolean; trustedDevices: unknown[] };
      loginHistory: unknown[];
    }>("auth/security/dashboard", { method: "GET", token });
  },

  sessions(token: string) {
    return apiRequest<{ sessions: Array<{ id: string; ipAddress?: string; userAgent?: string; createdAt: string }> }>(
      "auth/sessions",
      { method: "GET", token },
    );
  },

  revokeSession(token: string, sessionId: string) {
    return apiRequest(`auth/sessions/${sessionId}`, { method: "DELETE", token });
  },

  revokeAllSessions(token: string) {
    return apiRequest("auth/sessions", { method: "DELETE", token });
  },

  setupMfa(token: string) {
    return apiRequest<{ secret: string; otpAuthUrl: string; backupCodes: string[] }>("auth/mfa/setup", {
      method: "POST",
      token,
    });
  },

  enableMfa(token: string, mfaCode: string) {
    return apiRequest<{ message: string }>("auth/mfa/enable", { method: "POST", token, body: { mfaCode } });
  },

  disableMfa(token: string, body: { mfaCode: string; backupCode?: string }) {
    return apiRequest<{ message: string }>("auth/mfa/disable", { method: "POST", token, body });
  },

  securitySettings(token: string) {
    return apiRequest<{
      mfaEnabled: boolean;
      securityNotificationsEnabled: boolean;
      trustedDevices: unknown[];
      passwordExpiresAt?: string;
    }>("auth/security/settings", { method: "GET", token });
  },

  updateSecuritySettings(token: string, body: { securityNotificationsEnabled?: boolean }) {
    return apiRequest<{
      mfaEnabled: boolean;
      securityNotificationsEnabled: boolean;
      trustedDevices: unknown[];
      passwordExpiresAt?: string;
    }>("auth/security/settings", { method: "PATCH", token, body });
  },
};
