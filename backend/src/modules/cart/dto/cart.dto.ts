import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(99)
  quantity?: number;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class SyncCartDto {
  @ApiProperty({ type: [Object] })
  items!: { variantId: string; quantity: number }[];
}

export class SaveForLaterDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;
}
