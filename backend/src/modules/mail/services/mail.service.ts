import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { SendEmailDto } from "../dto/send-email.dto";

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.getOrThrow<string>("mail.resendApiKey"));
  }

  async sendEmail(input: SendEmailDto) {
    return this.resend.emails.send({
      from: this.configService.getOrThrow<string>("mail.from"),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}
