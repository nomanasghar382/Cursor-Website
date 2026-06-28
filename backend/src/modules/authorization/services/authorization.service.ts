import { Injectable } from "@nestjs/common";
import { AuthorizationRepository } from "../repositories/authorization.repository";

@Injectable()
export class AuthorizationService {
  constructor(private readonly authorizationRepository: AuthorizationRepository) {}

  listRoles() {
    return this.authorizationRepository.listRoles().then((roles) =>
      roles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        type: role.type,
        scope: role.scope,
        permissions: role.rolePermissions.map((entry) => `${entry.permission.resource}:${entry.permission.action}`),
      })),
    );
  }

  listPermissions() {
    return this.authorizationRepository.listPermissions().then((permissions) =>
      permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
        resource: permission.resource,
        action: permission.action,
      })),
    );
  }

  assignPermission(roleId: string, permissionId: string) {
    return this.authorizationRepository.assignPermission(roleId, permissionId);
  }
}
