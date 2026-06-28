import { Body, Controller, Get, Param, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AuthorizationService } from "../services/authorization.service";

class AssignPermissionDto {
  @ApiProperty()
  @IsUUID()
  permissionId!: string;
}

@ApiTags("Authorization")
@ApiBearerAuth()
@Controller({ path: "authorization", version: ["1", VERSION_NEUTRAL] })
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get("roles")
  @Permissions("users:read")
  listRoles() {
    return this.authorizationService.listRoles();
  }

  @Get("permissions")
  @Permissions("users:read")
  listPermissions() {
    return this.authorizationService.listPermissions();
  }

  @Post("roles/:roleId/permissions")
  @Permissions("users:write")
  assignPermission(@Param("roleId") roleId: string, @Body() body: AssignPermissionDto) {
    return this.authorizationService.assignPermission(roleId, body.permissionId);
  }
}
