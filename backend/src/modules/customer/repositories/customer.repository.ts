import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  getUserDashboardData(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: { where: { deletedAt: null }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { items: true, shipments: true, invoices: true },
        },
        wishlists: {
          where: { deletedAt: null },
          include: { items: { where: { deletedAt: null }, take: 4, include: { product: { include: { images: { take: 1 } } } } } },
        },
        recentlyViewed: {
          orderBy: { viewedAt: "desc" },
          take: 8,
          include: { product: { include: { images: { take: 1 }, category: true } } },
        },
        notifications: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        rewardPoints: { orderBy: { createdAt: "desc" } },
        aiRecommendations: {
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { product: { include: { images: { take: 1 }, category: true } } },
        },
      },
    });
  }

  getRewardBalance(userId: string) {
    return this.prisma.rewardPoint.aggregate({
      where: { userId },
      _sum: { pointsDelta: true },
    });
  }

  getOrderStats(userId: string) {
    return this.prisma.order.aggregate({
      where: { userId, status: { notIn: ["CANCELLED", "DRAFT"] } },
      _count: true,
      _sum: { grandTotal: true },
    });
  }

  listAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId, deletedAt: null },
      include: { country: true, city: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  findCountryByCode(code: string) {
    return this.prisma.country.findFirst({ where: { iso2: code.toUpperCase(), isActive: true } });
  }

  createAddress(userId: string, data: {
    countryId: string;
    cityId?: string;
    label?: string;
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    postalCode?: string;
    isDefault?: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.userAddress.create({ data: { userId, ...data } });
    });
  }

  updateAddress(userId: string, addressId: string, data: Partial<{
    label: string;
    recipientName: string;
    phone: string;
    line1: string;
    line2: string;
    postalCode: string;
    isDefault: boolean;
  }>) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.userAddress.update({ where: { id: addressId, userId }, data });
    });
  }

  deleteAddress(userId: string, addressId: string) {
    return this.prisma.userAddress.update({
      where: { id: addressId, userId },
      data: { deletedAt: new Date() },
    });
  }

  listNotifications(userId: string, take = 20) {
    return this.prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  markNotificationRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date(), status: "READ" },
    });
  }

  listPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { order: { userId } },
      include: { order: true, transactions: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  listInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { order: { userId } },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  updateUserMetadata(userId: string, metadata: Record<string, unknown>) {
    return this.prisma.user.findUnique({ where: { id: userId } }).then(async (user) => {
      const current = (user?.metadata ?? {}) as Record<string, unknown>;
      return this.prisma.user.update({
        where: { id: userId },
        data: { metadata: { ...current, ...metadata } as Prisma.InputJsonValue },
      });
    });
  }

  updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl },
    });
  }

  softDeleteAccount(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: "DELETED", deletedAt: new Date() },
    });
  }
}
