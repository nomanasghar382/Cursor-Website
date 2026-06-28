import { Controller, Delete, Get, Param, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { SessionService } from "../services/session.service";

@ApiTags("Sessions")
@ApiBearerAuth()
@Controller({ path: "auth/sessions", version: ["1", VERSION_NEUTRAL] })
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.listSessions(user.id);
  }

  @Delete(":sessionId")
  revoke(@CurrentUser() user: AuthenticatedUser, @Param("sessionId") sessionId: string) {
    return this.sessionService.revokeSession(user.id, sessionId);
  }

  @Delete()
  revokeAll(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.revokeAllSessions(user.id);
  }
}
