import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GitHubOAuthStrategy extends PassportStrategy(Strategy, "github") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("auth.githubClientId"),
      clientSecret: configService.getOrThrow<string>("auth.githubClientSecret"),
      callbackURL: `${configService.getOrThrow<string>("auth.oauthCallbackBaseUrl")}/api/auth/oauth/github/callback`,
      scope: ["user:email"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: (error: Error | null, user?: unknown) => void): void {
    done(null, {
      provider: "github",
      email: profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`,
      firstName: profile.displayName?.split(" ")[0] ?? profile.username ?? "GitHub",
      lastName: profile.displayName?.split(" ").slice(1).join(" ") || "User",
      providerUserId: profile.id,
    });
  }
}
