import { ApiError } from "@/types/api";

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isUnauthorizedError(error: unknown) {
  return isApiError(error) && error.status === 401;
}

export function isRateLimitError(error: unknown) {
  return isApiError(error) && error.status === 429;
}
