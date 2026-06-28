import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("auth.googleClientId"),
      clientSecret: configService.getOrThrow<string>("auth.googleClientSecret"),
      callbackURL: `${configService.getOrThrow<string>("auth.oauthCallbackBaseUrl")}/api/auth/oauth/google/callback`,
      scope: ["email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
    done(null, {
      provider: "google",
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName ?? "NOVAEX",
      lastName: profile.name?.familyName ?? "User",
      providerUserId: profile.id,
    });
  }
}
