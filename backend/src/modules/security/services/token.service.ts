import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import { JwtAccessPayload, JwtRefreshPayload } from "../../../common/types/authenticated-user.type";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken(payload: Omit<JwtAccessPayload, "tokenType">): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: "access" },
      {
        secret: this.configService.getOrThrow<string>("auth.jwtAccessSecret"),
        expiresIn: this.configService.getOrThrow<string>("auth.accessExpiresIn") as never,
      },
    );
  }

  signRefreshToken(userId: string, familyId: string = randomUUID(), rememberMe = false): Promise<{ token: string; familyId: string }> {
    const payload: JwtRefreshPayload = { sub: userId, familyId, tokenType: "refresh", rememberMe };
    return this.jwtService
      .signAsync(payload, {
        secret: this.configService.getOrThrow<string>("auth.jwtRefreshSecret"),
        expiresIn: (rememberMe
          ? this.configService.getOrThrow<string>("auth.rememberMeExpiresIn")
          : this.configService.getOrThrow<string>("auth.refreshExpiresIn")) as never,
      })
      .then((token) => ({ token, familyId }));
  }

  verifyAccessToken(token: string): Promise<JwtAccessPayload> {
    return this.jwtService.verifyAsync<JwtAccessPayload>(token, {
      secret: this.configService.getOrThrow<string>("auth.jwtAccessSecret"),
    });
  }

  verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    return this.jwtService.verifyAsync<JwtRefreshPayload>(token, {
      secret: this.configService.getOrThrow<string>("auth.jwtRefreshSecret"),
    });
  }

  getRefreshExpiryDate(rememberMe = false): Date {
    const duration = rememberMe
      ? this.configService.getOrThrow<string>("auth.rememberMeExpiresIn")
      : this.configService.getOrThrow<string>("auth.refreshExpiresIn");
    return this.addDuration(new Date(), duration);
  }

  private addDuration(base: Date, duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multiplier = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
    return new Date(base.getTime() + amount * multiplier);
  }
}
