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
};
