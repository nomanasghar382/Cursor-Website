import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthContext } from "../../../common/decorators/auth-context.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { Roles } from "../../../common/decorators/roles.decorator";
import { REFRESH_TOKEN_COOKIE } from "../../../common/constants/app.constants";
import { AuthRequestContext } from "../../../common/types/auth-context.type";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { LoginDto } from "../dto/login.dto";
import { MagicLinkRequestDto, MagicLinkVerifyDto } from "../dto/magic-link.dto";
import { DisableMfaDto, SecuritySettingsDto, VerifyMfaDto } from "../dto/mfa.dto";
import { OtpRequestDto, OtpVerifyDto } from "../dto/otp.dto";
import { ChangeEmailDto, UpdateProfileDto } from "../dto/profile.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { RegisterDto } from "../dto/register.dto";
import { ResendVerificationDto } from "../dto/resend-verification.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { UnlockAccountDto } from "../dto/unlock-account.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { AuthService } from "../services/auth.service";

@ApiTags("Auth")
@Controller({ path: "auth", version: ["1", VERSION_NEUTRAL] })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("register")
  register(@Body() dto: RegisterDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.register(dto, context);
  }

  @Public()
  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.verifyEmail(dto, context);
  }

  @Public()
  @Post("resend-verification")
  resendVerification(@Body() dto: ResendVerificationDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.resendVerification(dto, context);
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: LoginDto, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(dto, context, response);
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("vendor/login")
  vendorLogin(@Body() dto: LoginDto, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.authService.login({ ...dto, audience: "vendor" }, context, response);
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("admin/login")
  adminLogin(@Body() dto: LoginDto, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.authService.login({ ...dto, audience: "admin" }, context, response);
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("super-admin/login")
  superAdminLogin(@Body() dto: LoginDto, @AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.authService.login({ ...dto, audience: "super-admin" }, context, response);
  }

  @ApiBearerAuth()
  @Post("logout")
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @AuthContext() context: AuthRequestContext,
  ) {
    const refreshCookie = request.signedCookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    return this.authService.logout(user.id, dto.refreshToken ?? refreshCookie, response, context);
  }

  @Public()
  @Post("refresh")
  refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @AuthContext() context: AuthRequestContext,
  ) {
    const refreshCookie = request.signedCookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    return this.authService.refresh(dto, refreshCookie, context, response);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.forgotPassword(dto, context);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.resetPassword(dto, context);
  }

  @ApiBearerAuth()
  @Patch("change-password")
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.changePassword(user.id, dto, context);
  }

  @ApiBearerAuth()
  @Post("mfa/setup")
  setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupMfa(user.id);
  }

  @ApiBearerAuth()
  @Post("mfa/enable")
  enableMfa(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyMfaDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.enableMfa(user.id, dto, context);
  }

  @ApiBearerAuth()
  @Post("mfa/disable")
  disableMfa(@CurrentUser() user: AuthenticatedUser, @Body() dto: DisableMfaDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.disableMfa(user.id, dto, context);
  }

  @Public()
  @Post("magic-link/request")
  requestMagicLink(@Body() dto: MagicLinkRequestDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.requestMagicLink(dto, context);
  }

  @Public()
  @Post("magic-link/verify")
  verifyMagicLink(
    @Body() dto: MagicLinkVerifyDto,
    @AuthContext() context: AuthRequestContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.verifyMagicLink(dto, context, response);
  }

  @Public()
  @Post("otp/request")
  requestOtp(@Body() dto: OtpRequestDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.requestOtp(dto, context);
  }

  @Public()
  @Post("otp/verify")
  verifyOtp(
    @Body() dto: OtpVerifyDto,
    @AuthContext() context: AuthRequestContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.verifyOtp(dto, context, response);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  @ApiBearerAuth()
  @Patch("profile")
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @ApiBearerAuth()
  @Patch("email")
  changeEmail(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangeEmailDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.changeEmail(user.id, dto, context);
  }

  @ApiBearerAuth()
  @Get("security/settings")
  securitySettings(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSecuritySettings(user.id);
  }

  @ApiBearerAuth()
  @Patch("security/settings")
  updateSecuritySettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: SecuritySettingsDto) {
    return this.authService.updateSecuritySettings(user.id, dto);
  }

  @ApiBearerAuth()
  @Get("security/dashboard")
  securityDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSecurityDashboard(user.id);
  }

  @ApiBearerAuth()
  @Roles("super-admin")
  @Post("admin/unlock-account")
  unlockAccount(@CurrentUser() user: AuthenticatedUser, @Body() dto: UnlockAccountDto, @AuthContext() context: AuthRequestContext) {
    return this.authService.unlockAccount(dto, user.id, context);
  }

  @Public()
  @Get("oauth/providers")
  oauthProviders() {
    return this.authService.getOAuthProviders();
  }

  @Public()
  @Post("demo")
  demo(@AuthContext() context: AuthRequestContext, @Res({ passthrough: true }) response: Response) {
    return this.authService.demo(context, response);
  }
}
