import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { MailService } from "../../mail/services/mail.service";
import { NotificationsGateway } from "../../../websocket/notifications.gateway";
import { CreateNotificationDto } from "../dto/create-notification.dto";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async notifyUser(input: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: "system",
        channel: "IN_APP",
        title: input.title,
        body: input.body,
        status: "QUEUED",
      },
    });

    this.notificationsGateway.emitUserNotification(input.userId, notification);

    if (input.email) {
      await this.mailService.sendEmail({
        to: input.email,
        subject: input.title,
        html: `<p>${input.body}</p>`,
      });
    }

    return notification;
  }
}
