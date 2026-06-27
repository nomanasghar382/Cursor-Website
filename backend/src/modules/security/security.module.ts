import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../../common/strategies/jwt.strategy";
import { betterAuthProvider } from "./providers/better-auth.provider";
import { PasswordService } from "./services/password.service";
import { TokenService } from "./services/token.service";

@Module({
  imports: [JwtModule.register({}), PassportModule.register({ defaultStrategy: "jwt" })],
  providers: [PasswordService, TokenService, JwtStrategy, betterAuthProvider],
  exports: [PasswordService, TokenService, JwtModule, PassportModule, betterAuthProvider],
})
export class SecurityModule {}
