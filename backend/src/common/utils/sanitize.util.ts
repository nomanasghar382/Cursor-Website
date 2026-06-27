import xss from "xss";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "set-cookie",
]);

export function sanitizeHtml(value: string): string {
  return xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}

export function sanitizeObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((accumulator, [key, item]) => {
      if (SENSITIVE_KEYS.has(key)) {
        accumulator[key] = "[REDACTED]";
      } else {
        accumulator[key] = sanitizeObject(item);
      }
      return accumulator;
    }, {}) as T;
  }

  if (typeof value === "string") {
    return sanitizeHtml(value) as T;
  }

  return value;
}
