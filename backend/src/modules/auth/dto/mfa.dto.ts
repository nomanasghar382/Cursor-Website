import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class EnableMfaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class VerifyMfaDto {
  @ApiProperty()
  @IsString()
  mfaCode!: string;
}

export class DisableMfaDto {
  @ApiProperty()
  @IsString()
  mfaCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backupCode?: string;
}

export class SecuritySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  securityNotificationsEnabled?: boolean;
}
