import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "customer@novaex.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: "Password must include upper, lower, number, and special character.",
  })
  password!: string;

  @ApiProperty({ example: "Maya" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Chen" })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
