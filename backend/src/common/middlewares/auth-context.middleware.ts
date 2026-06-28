import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { AuthRequestContext } from "../types/auth-context.type";
import { REQUEST_ID_HEADER } from "../constants/app.constants";

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  use(request: Request & { authContext?: AuthRequestContext; requestId?: string }, _response: Response, next: NextFunction): void {
    const forwarded = request.header("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || request.ip || "0.0.0.0";
    const userAgent = request.header("user-agent") ?? undefined;
    const deviceId = request.header("x-device-id") ?? undefined;
    const fingerprintSource = [deviceId, userAgent, request.header("accept-language")].filter(Boolean).join("|");
    const deviceFingerprint = createHash("sha256").update(fingerprintSource || ipAddress).digest("hex");

    request.authContext = {
      ipAddress,
      userAgent,
      deviceId,
      deviceFingerprint,
      requestId: request.requestId ?? request.header(REQUEST_ID_HEADER) ?? undefined,
    };
    next();
  }
}
