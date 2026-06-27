import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { CSRF_COOKIE, CSRF_HEADER } from "../constants/app.constants";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const enabled = this.configService.get<boolean>("security.csrfEnabled", false);
    if (!enabled) {
      next();
      return;
    }

    const csrfCookie = request.cookies?.[CSRF_COOKIE] as string | undefined;
    const csrfToken = csrfCookie ?? randomBytes(32).toString("base64url");
    response.cookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      sameSite: "strict",
      secure: this.configService.get<string>("app.nodeEnv") === "production",
      signed: true,
    });

    if (SAFE_METHODS.has(request.method)) {
      next();
      return;
    }

    const headerToken = request.header(CSRF_HEADER);
    if (!headerToken || !csrfCookie || !this.tokensMatch(headerToken, csrfCookie)) {
      throw new ForbiddenException("CSRF token is invalid.");
    }

    next();
  }

  private tokensMatch(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
