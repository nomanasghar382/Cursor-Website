import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../../common/constants/app.constants";

@Injectable()
export class CookieAuthService {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(response: Response, accessToken: string, refreshToken: string, rememberMe = false): void {
    const secure = this.configService.get<string>("app.nodeEnv") === "production";
    const accessMaxAge = this.durationToMs(this.configService.getOrThrow<string>("auth.accessExpiresIn"));
    const refreshMaxAge = this.durationToMs(
      rememberMe
        ? this.configService.getOrThrow<string>("auth.rememberMeExpiresIn")
        : this.configService.getOrThrow<string>("auth.refreshExpiresIn"),
    );

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      maxAge: accessMaxAge,
      signed: true,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      maxAge: refreshMaxAge,
      signed: true,
      path: "/api/auth/refresh",
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE);
    response.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth/refresh" });
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
