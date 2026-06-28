import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { EmailsModule } from "../../emails/emails.module";
import { MailModule } from "../mail/mail.module";
import { SecurityModule } from "../security/security.module";
import { SessionModule } from "../session/session.module";
import { AuthController } from "./controllers/auth.controller";
import { OAuthController } from "./controllers/oauth.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { OAuthAuthService } from "./services/oauth-auth.service";
import { GoogleOAuthStrategy } from "./strategies/google-oauth.strategy";
import { GitHubOAuthStrategy } from "./strategies/github-oauth.strategy";

const oauthProviders = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleOAuthStrategy] : []),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [GitHubOAuthStrategy] : []),
];

@Module({
  imports: [SecurityModule, SessionModule, MailModule, EmailsModule, AuditModule],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, AuthRepository, OAuthAuthService, ...oauthProviders],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
