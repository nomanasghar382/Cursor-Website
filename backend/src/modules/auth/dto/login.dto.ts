import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@novaex.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({ enum: ["customer", "vendor", "admin", "super-admin"] })
  @IsOptional()
  @IsIn(["customer", "vendor", "admin", "super-admin"])
  audience?: "customer" | "vendor" | "admin" | "super-admin";

  @ApiPropertyOptional({ description: "Required when MFA is enabled." })
  @IsOptional()
  @IsString()
  mfaCode?: string;

  @ApiPropertyOptional({ description: "Trust this device after successful login." })
  @IsOptional()
  @IsBoolean()
  trustDevice?: boolean;
}
