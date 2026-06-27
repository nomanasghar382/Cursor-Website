import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";

@Injectable()
export class PasswordService {
  private readonly rounds = 12;

  hashPassword(password: string): Promise<string> {
    return hash(password, this.rounds);
  }

  verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
