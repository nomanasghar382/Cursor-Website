import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class MagicLinkRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class MagicLinkVerifyDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(16)
  token!: string;
}
