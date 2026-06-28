import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class UnlockAccountDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}
