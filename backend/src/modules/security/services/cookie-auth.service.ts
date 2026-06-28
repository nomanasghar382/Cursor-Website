import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../../common/constants/app.constants";

const REFRESH_COOKIE_PATH = "/api/v1/auth";

@Injectable()
export class CookieAuthService {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(response: Response, accessToken: string, refreshToken: string, rememberMe = false): void {
    const secure = this.configService.get<string>("app.nodeEnv") === "production";
    const sameSite = secure ? "none" : "strict";
    const accessMaxAge = this.durationToMs(this.configService.getOrThrow<string>("auth.accessExpiresIn"));
    const refreshMaxAge = this.durationToMs(
      rememberMe
        ? this.configService.getOrThrow<string>("auth.rememberMeExpiresIn")
        : this.configService.getOrThrow<string>("auth.refreshExpiresIn"),
    );

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: accessMaxAge,
      signed: true,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: refreshMaxAge,
      signed: true,
      path: REFRESH_COOKIE_PATH,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE);
    response.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  private durationToMs(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return 15 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multiplier = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
    return amount * multiplier;
  }
}
