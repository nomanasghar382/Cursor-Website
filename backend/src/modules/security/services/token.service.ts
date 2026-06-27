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

  async signAccessToken(payload: Omit<JwtAccessPayload, "tokenType">): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: "access" },
      {
        secret: this.configService.getOrThrow<string>("auth.jwtAccessSecret"),
        expiresIn: this.configService.getOrThrow<string>("auth.accessExpiresIn") as never,
      },
    );
  }

  async signRefreshToken(userId: string, familyId = randomUUID()): Promise<{ token: string; familyId: string }> {
    const payload: JwtRefreshPayload = { sub: userId, familyId, tokenType: "refresh" };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("auth.jwtRefreshSecret"),
      expiresIn: this.configService.getOrThrow<string>("auth.refreshExpiresIn") as never,
    });
    return { token, familyId };
  }
}
