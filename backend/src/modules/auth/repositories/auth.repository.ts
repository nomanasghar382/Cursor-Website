import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        roles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  createCustomer(input: { email: string; passwordHash: string; firstName: string; lastName: string; phone?: string }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        authProvider: "EMAIL",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: { profile: true, roles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } } },
    });
  }

  async attachCustomerRole(userId: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { slug: "customer" } });
    if (!role) {
      return;
    }

    const existing = await this.prisma.userRole.findFirst({ where: { userId, roleId: role.id, deletedAt: null } });
    if (!existing) {
      await this.prisma.userRole.create({ data: { userId, roleId: role.id } });
    }
  }

  createRefreshToken(input: { userId: string; tokenHash: string; familyId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({
      data: input,
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}
