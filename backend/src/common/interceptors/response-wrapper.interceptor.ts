import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable, map } from "rxjs";
import { REQUEST_ID_HEADER } from "../constants/app.constants";
import { ApiResponse } from "../types/api-response.type";
import { sanitizeObject } from "../utils/sanitize.util";

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { requestId?: string }>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode: response.statusCode,
        message: "Request completed successfully.",
        data: sanitizeObject(data),
        meta: {
          requestId: request.requestId ?? request.header(REQUEST_ID_HEADER) ?? "unknown",
          timestamp: new Date().toISOString(),
          path: request.originalUrl,
          durationMs: Date.now() - startedAt,
        },
      })),
    );
  }
}
