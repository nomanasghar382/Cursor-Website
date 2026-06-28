import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
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

export class AiChatDto {
  @ApiProperty({ example: "Find me wireless earbuds under $200" })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  productIds?: string[];
}

export class AiSearchDto {
  @ApiProperty({ example: "premium noise cancelling headphones for travel" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  query!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number;
}

export class AiSearchSuggestionsDto {
  @ApiProperty({ example: "wireless" })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  q!: string;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class AiSearchClickDto {
  @ApiProperty()
  @IsUUID()
  searchHistoryId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;
}

export class AiRecommendationsQueryDto {
  @ApiPropertyOptional({
    enum: [
      "personalized",
      "recently-viewed",
      "cart",
      "purchase-history",
      "similar",
      "frequently-bought-together",
      "cross-sell",
      "upsell",
    ],
  })
  @IsOptional()
  @IsIn([
    "personalized",
    "recently-viewed",
    "cart",
    "purchase-history",
    "similar",
    "frequently-bought-together",
    "cross-sell",
    "upsell",
  ])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit?: number;
}

export class AiVoiceSearchDto {
  @ApiProperty({ example: "Show me smart home devices under three hundred dollars" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  transcript!: string;

  @ApiPropertyOptional({ example: "en-US" })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @ApiPropertyOptional({ description: "Optional audio asset URL when speech-to-text is handled client-side." })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  audioAssetUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;
}

export class AiCompareDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  productIds!: string[];
}
