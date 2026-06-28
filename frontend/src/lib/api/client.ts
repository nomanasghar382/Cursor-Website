import { siteConfig } from "@/config/site";
import type { ApiErrorPayload, ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

function resolveMessage(payload: ApiErrorPayload, fallback: string) {
  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }
  return payload.message ?? payload.error ?? fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const url = `${siteConfig.apiUrl}/${path.replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T> | ApiErrorPayload;

  if (!response.ok) {
    throw new ApiError(resolveMessage(payload, `Request failed with ${response.status}`), response.status, payload);
  }

  if ("data" in payload && payload.data !== undefined) {
    return payload.data;
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return siteConfig.apiUrl;
}
