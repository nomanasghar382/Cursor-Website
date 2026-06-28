import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { SecurityLogService } from "../../security/services/security-log.service";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "./auth.service";

export interface OAuthProfile {
  provider: "google" | "github";
  email: string;
  firstName: string;
  lastName: string;
  providerUserId: string;
}

@Injectable()
export class OAuthAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
    private readonly securityLogService: SecurityLogService,
  ) {}

  async handleOAuthLogin(profile: OAuthProfile, context: AuthRequestContext, response: Response) {
    let user = await this.authRepository.findUserByEmail(profile.email);
    if (!user) {
      user = await this.authRepository.createOAuthUser({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        authProvider: profile.provider === "google" ? "GOOGLE" : "EMAIL",
        metadata: {
          oauth: {
            provider: profile.provider,
            providerUserId: profile.providerUserId,
          },
        },
      });
      await this.authRepository.attachRole(user.id, "customer");
      user = (await this.authRepository.findUserById(user.id))!;
    }

    await this.securityLogService.record({
      userId: user.id,
      eventType: `auth.oauth_${profile.provider}_success`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { providerUserId: profile.providerUserId },
    });

    return this.authService.establishAuthenticatedSession(user, context, response, false);
  }
}
