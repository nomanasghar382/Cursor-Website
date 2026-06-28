export type ApiMeta = {
  requestId: string;
  timestamp: string;
  path: string;
  durationMs: number;
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorPayload = {
  success?: boolean;
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload;

  constructor(message: string, status: number, payload: ApiErrorPayload = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
