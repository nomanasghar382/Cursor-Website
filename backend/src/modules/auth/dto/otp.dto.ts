import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, Length } from "class-validator";

export class OtpRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ["login", "verify-email", "reset-password"] })
  @IsIn(["login", "verify-email", "reset-password"])
  purpose!: "login" | "verify-email" | "reset-password";
}

export class OtpVerifyDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ["login", "verify-email", "reset-password"] })
  @IsIn(["login", "verify-email", "reset-password"])
  purpose!: "login" | "verify-email" | "reset-password";

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code!: string;
}
