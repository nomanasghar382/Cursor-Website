import { Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

const webOrigins = (process.env.WEB_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  namespace: "notifications",
  cors: { origin: webOrigins, credentials: true },
})
export class NotificationsGateway {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  emitUserNotification(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit("notification", payload);
    this.logger.debug(`Notification emitted to user:${userId}`);
  }

  emitSystemNotification(payload: unknown): void {
    this.server.emit("system", payload);
  }
}
