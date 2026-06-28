import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: "Refresh token when not sent via secure cookie." })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
