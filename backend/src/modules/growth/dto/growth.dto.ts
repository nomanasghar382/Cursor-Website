import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class GrowthPaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
}

export class UpsertCmsPageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] })
  @IsOptional()
  @IsEnum(["DRAFT", "PUBLISHED", "ARCHIVED"])
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  sections?: Array<Record<string, unknown>>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

export class UpsertBlogDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsString()
  excerpt!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] })
  @IsOptional()
  @IsEnum(["DRAFT", "PUBLISHED", "ARCHIVED"])
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedAt?: string;
}

export class UpsertFaqDto {
  @ApiProperty()
  @IsString()
  question!: string;

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertBannerDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  imageUrl!: string;

  @ApiProperty()
  @IsString()
  placement!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsAt?: string;
}

export class UpsertHeroDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertCampaignDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;

  @ApiProperty()
  @IsString()
  startsAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsAt?: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpsertLandingPageDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cmsPageId?: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] })
  @IsOptional()
  @IsEnum(["DRAFT", "PUBLISHED", "ARCHIVED"])
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  sections?: Array<Record<string, unknown>>;
}

export class UpsertCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty({ enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"] })
  @IsString()
  discountType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  discountValue!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsAt?: string;
}

export class NewsletterSubscribeDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class ReferralJoinDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  code!: string;
}

export class AffiliateTrackDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visitorId?: string;
}

export class ContentApprovalDto {
  @ApiProperty({ enum: ["approve", "reject"] })
  @IsEnum(["approve", "reject"])
  action!: "approve" | "reject";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class SeoPathQueryDto {
  @ApiProperty()
  @IsString()
  path!: string;

  @ApiPropertyOptional({ enum: ["page", "blog", "product", "category"] })
  @IsOptional()
  @IsString()
  type?: string;
}

export class TrackEventDto {
  @ApiProperty()
  @IsString()
  eventType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class SeoMetadataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  canonical?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitterCard?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitterImage?: string;
}

export class CreateGiftCardDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  initialBalance!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currencyCode?: string;
}

export class SendMarketingEmailDto {
  @ApiProperty({ enum: ["welcome", "abandoned_cart", "product_recommendation", "campaign"] })
  @IsString()
  template!: string;

  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
