import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser, JwtAccessPayload } from "../types/authenticated-user.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { cookies?: Record<string, string> }) => request.cookies?.novaex_access ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("auth.jwtAccessSecret"),
    });
  }

  validate(payload: JwtAccessPayload): AuthenticatedUser {
    if (payload.tokenType !== "access") {
      throw new UnauthorizedException("Invalid token type.");
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      vendorIds: payload.vendorIds ?? [],
      storeIds: payload.storeIds ?? [],
    };
  }
}
