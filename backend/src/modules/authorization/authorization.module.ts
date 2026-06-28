import { Module } from "@nestjs/common";
import { AuthorizationController } from "./controllers/authorization.controller";
import { AuthorizationRepository } from "./repositories/authorization.repository";
import { AuthorizationService } from "./services/authorization.service";

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AuthorizationRepository],
  exports: [AuthorizationService, AuthorizationRepository],
})
export class AuthorizationModule {}
