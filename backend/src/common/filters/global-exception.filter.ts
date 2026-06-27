import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { REQUEST_ID_HEADER } from "../constants/app.constants";
import { ApiErrorResponse } from "../types/api-response.type";
import { sanitizeObject } from "../utils/sanitize.util";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { requestId?: string }>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === "object" && exceptionResponse && "message" in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception instanceof Error
          ? exception.message
          : "Internal server error.";

    const errorCode = exception instanceof HttpException ? exception.constructor.name : "InternalServerError";
    const payload: ApiErrorResponse = {
      success: false,
      statusCode,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join("; ") : message,
        details: statusCode >= 500 ? undefined : sanitizeObject(exceptionResponse),
      },
      meta: {
        requestId: request.requestId ?? request.header(REQUEST_ID_HEADER) ?? "unknown",
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      },
    };

    if (statusCode >= 500) {
      this.logger.error(payload.error.message, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(`${statusCode} ${request.method} ${request.originalUrl}: ${payload.error.message}`);
    }

    response.status(statusCode).json(payload);
  }
}
