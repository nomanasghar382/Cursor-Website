export const IS_PUBLIC_KEY = "isPublic";
export const ROLES_KEY = "roles";
export const PERMISSIONS_KEY = "permissions";
export const REQUEST_ID_HEADER = "x-request-id";
export const CSRF_HEADER = "x-csrf-token";
export const CSRF_COOKIE = "novaex_csrf";
export const ACCESS_TOKEN_COOKIE = "novaex_access";
export const REFRESH_TOKEN_COOKIE = "novaex_refresh";

export const QUEUES = {
  AUDIT: "audit",
  EMAIL: "email",
  NOTIFICATIONS: "notifications",
  MEDIA: "media",
} as const;
