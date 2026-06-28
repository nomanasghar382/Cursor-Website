import { siteConfig } from "@/config/site";
import type { ApiErrorPayload, ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

function resolveMessage(payload: ApiErrorPayload, fallback: string) {
  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }
  return payload.message ?? payload.error ?? fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = options;
  const url = `${siteConfig.apiUrl}/${path.replace(/^\//, "")}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
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
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function getApiBaseUrl() {
  return siteConfig.apiUrl;
}
