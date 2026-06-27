import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  body!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
