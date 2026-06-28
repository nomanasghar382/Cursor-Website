import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { hashSecret } from "../../../common/utils/crypto.util";

const userInclude = {
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
} satisfies Prisma.UserInclude;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: userInclude });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: userInclude });
  }

  createCustomer(input: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    metadata?: Prisma.InputJsonObject;
  }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        authProvider: "EMAIL",
        status: "PENDING",
        metadata: input.metadata,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: userInclude,
    });
  }

  createOAuthUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    authProvider: "EMAIL" | "GOOGLE" | "APPLE";
    metadata?: Prisma.InputJsonObject;
  }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        authProvider: input.authProvider,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        metadata: input.metadata,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: userInclude,
    });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data, include: userInclude });
  }

  updateProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return this.prisma.userProfile.update({ where: { userId }, data });
  }

  async attachRole(userId: string, slug: string, vendorId?: string, storeId?: string) {
    const role = await this.prisma.role.findUnique({ where: { slug } });
    if (!role) {
      return;
    }
    const existing = await this.prisma.userRole.findFirst({
      where: { userId, roleId: role.id, vendorId: vendorId ?? null, storeId: storeId ?? null, deletedAt: null },
    });
    if (!existing) {
      await this.prisma.userRole.create({ data: { userId, roleId: role.id, vendorId, storeId } });
    }
  }

  createRefreshToken(input: { userId: string; tokenHash: string; familyId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data: input });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  rotateRefreshToken(tokenHash: string, replacement: { tokenHash: string; familyId: string; expiresAt: Date; userId: string }) {
    return this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { tokenHash },
        data: { rotatedAt: new Date(), revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: replacement,
      }),
    ]);
  }

  revokeRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  revokeRefreshFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  hashToken(token: string): string {
    return hashSecret(token);
  }
}
