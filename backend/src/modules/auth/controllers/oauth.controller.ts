import { Controller, Get, Req, Res, UseGuards, VERSION_NEUTRAL } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthContext } from "../../../common/decorators/auth-context.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { OAuthAuthService, OAuthProfile } from "../services/oauth-auth.service";

@ApiTags("OAuth")
@Controller({ path: "auth/oauth", version: ["1", VERSION_NEUTRAL] })
export class OAuthController {
  constructor(private readonly oauthAuthService: OAuthAuthService) {}

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth(): void {}

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleCallback(@Req() request: { user: OAuthProfile }, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.oauthAuthService.handleOAuthLogin(request.user, context, response);
  }

  @Public()
  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubAuth(): void {}

  @Public()
  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  githubCallback(@Req() request: { user: OAuthProfile }, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.oauthAuthService.handleOAuthLogin(request.user, context, response);
  }
}
