import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class AuthorizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  listRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });
  }

  assignPermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });
  }

  assignUserRole(input: { userId: string; roleId: string; vendorId?: string; storeId?: string }) {
    return this.prisma.userRole.create({
      data: input,
    });
  }
}
