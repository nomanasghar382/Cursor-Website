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
  Min,
  MinLength,
} from "class-validator";

export class PaginationQueryDto {
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
}

export class UpdateOrderStatusDto {
  @ApiProperty()
  @IsString()
  status!: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsUUID()
  storeId!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  basePrice!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "ACTIVE", "ARCHIVED"] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visibility?: string;
}

export class BulkProductActionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  productIds!: string[];

  @ApiProperty({ enum: ["approve", "archive", "activate"] })
  @IsString()
  action!: "approve" | "archive" | "activate";
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CreateBrandDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  slug!: string;
}

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty({ enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"] })
  @IsString()
  discountType!: string;

  @ApiProperty()
  @IsNumber()
  discountValue!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  maxRedemptions?: number;
}

export class CreateGiftCardDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsNumber()
  initialBalance!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currencyCode?: string;
}

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ enum: ["NOT_STARTED", "IN_REVIEW", "APPROVED", "REJECTED"] })
  @IsOptional()
  @IsString()
  kycStatus?: string;
}

export class UpdateCustomerStatusDto {
  @ApiProperty({ enum: ["ACTIVE", "BLOCKED", "SUSPENDED"] })
  @IsString()
  status!: string;
}

export class UpdateSettingDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  value!: unknown;
}

export class UpdateFeatureFlagDto {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}

export class CreateCmsPageDto {
  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateBlogDto {
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
}

export class ExportReportDto {
  @ApiProperty({ enum: ["revenue", "sales", "customers", "inventory", "vendors", "marketing"] })
  @IsString()
  reportType!: string;

  @ApiProperty({ enum: ["csv", "json", "pdf"] })
  @IsString()
  format!: "csv" | "json" | "pdf";
}

export class AssignUserRoleDto {
  @ApiProperty()
  @IsUUID()
  roleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  storeId?: string;
}

export class CreateAdminUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsUUID()
  roleId!: string;
}
