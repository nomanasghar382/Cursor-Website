import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { WebsocketModule } from "../../websocket/websocket.module";
import { NotificationService } from "./services/notification.service";

@Module({
  imports: [MailModule, WebsocketModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
