import { Module } from "@nestjs/common";
import { SessionController } from "./controllers/session.controller";
import { SessionRepository } from "./repositories/session.repository";
import { SessionService } from "./services/session.service";

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionRepository],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}
