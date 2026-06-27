import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../constants/app.constants";
import { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const permissions = new Set(request.user?.permissions ?? []);
    const allowed = requiredPermissions.every((permission) => permissions.has(permission));

    if (!allowed) {
      throw new ForbiddenException("Required permission is missing.");
    }

    return true;
  }
}
