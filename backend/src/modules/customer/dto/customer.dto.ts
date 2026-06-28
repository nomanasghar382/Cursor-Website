import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  recipientName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  line2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ default: "US" })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOrderUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushOrderUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushPromotions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsAlerts?: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theme?: "light" | "dark" | "system";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reducedMotion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}

export class CreateReviewDto {
  @ApiProperty()
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  body!: string;
}

export class ReturnRequestDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}
