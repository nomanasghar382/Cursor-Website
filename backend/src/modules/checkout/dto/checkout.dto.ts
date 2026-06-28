import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class CheckoutAddressDto {
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

  @ApiProperty()
  @IsString()
  @MaxLength(32)
  postalCode!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  city!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  country!: string;
}

export class GuestCheckoutItemDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @ApiProperty()
  quantity!: number;
}

export class CheckoutPreviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shippingMethodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  giftCardCode?: string;

  @ApiPropertyOptional({ type: [GuestCheckoutItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCheckoutItemDto)
  guestItems?: GuestCheckoutItemDto[];
}

export class CheckoutCreateDto extends CheckoutPreviewDto {
  @ApiProperty({ type: CheckoutAddressDto })
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  shippingAddress!: CheckoutAddressDto;

  @ApiPropertyOptional({ type: CheckoutAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  billingAddress?: CheckoutAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  billingSameAsShipping?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentGateway?: "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY";
}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;
}
