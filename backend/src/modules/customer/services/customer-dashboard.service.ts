import { Injectable, NotFoundException } from "@nestjs/common";
import { CustomerRepository } from "../repositories/customer.repository";

@Injectable()
export class CustomerDashboardService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getDashboard(userId: string) {
    const [user, rewardBalance, orderStats] = await Promise.all([
      this.customerRepository.getUserDashboardData(userId),
      this.customerRepository.getRewardBalance(userId),
      this.customerRepository.getOrderStats(userId),
    ]);

    if (!user) throw new NotFoundException("User not found.");

    const points = rewardBalance._sum.pointsDelta ?? 0;
    const metadata = (user.metadata ?? {}) as {
      preferences?: Record<string, boolean>;
      settings?: Record<string, unknown>;
      walletBalance?: number;
    };

    const profileFields = [
      user.profile?.firstName,
      user.profile?.lastName,
      user.phone,
      user.emailVerifiedAt,
      user.profile?.avatarUrl,
    ];
    const accountCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    const wishlistItems = user.wishlists.flatMap((list) => list.items);

    return {
      welcome: {
        name: [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        avatarUrl: user.profile?.avatarUrl,
        emailVerified: Boolean(user.emailVerifiedAt),
        phoneVerified: Boolean(user.phoneVerifiedAt),
        accountCompletion,
      },
      loyalty: {
        points,
        tier: points >= 5000 ? "Platinum" : points >= 2500 ? "Gold" : points >= 1000 ? "Silver" : "Member",
        nextTierAt: points >= 5000 ? null : points >= 2500 ? 5000 : points >= 1000 ? 2500 : 1000,
      },
      wallet: {
        balance: metadata.walletBalance ?? 0,
        currencyCode: "USD",
        architecture: "Gift cards, store credit, and reward redemption flow ready",
      },
      statistics: {
        totalOrders: orderStats._count,
        lifetimeSpend: Number(orderStats._sum.grandTotal ?? 0),
        wishlistItems: wishlistItems.length,
        savedAddresses: user.addresses.length,
        unreadNotifications: user.notifications.filter((entry) => !entry.readAt).length,
      },
      quickActions: [
        { label: "Track latest order", href: user.orders[0] ? `/account/orders/${user.orders[0].id}` : "/account/orders" },
        { label: "Manage addresses", href: "/account/addresses" },
        { label: "View wishlist", href: "/wishlist" },
        { label: "Security center", href: "/account/security" },
      ],
      aiInsights: [
        `You have ${orderStats._count} fulfilled orders with $${Number(orderStats._sum.grandTotal ?? 0).toFixed(0)} lifetime value.`,
        points > 0 ? `${points} reward points available for premium checkout savings.` : "Complete your first order to start earning reward points.",
        user.recentlyViewed.length > 0 ? "AI detected renewed interest in recently viewed products." : "Browse the catalog to unlock personalized AI recommendations.",
      ],
      recentOrders: user.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        grandTotal: Number(order.grandTotal),
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        estimatedDeliveryDays: (order.shipments[0]?.metadata as { estimatedDays?: number })?.estimatedDays ?? 5,
      })),
      wishlistSummary: {
        count: wishlistItems.length,
        items: wishlistItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          imageUrl: item.product.images[0]?.url,
        })),
      },
      addresses: user.addresses.map((address) => ({
        id: address.id,
        label: address.label,
        recipientName: address.recipientName,
        line1: address.line1,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      })),
      recentlyViewed: user.recentlyViewed.map((entry) => ({
        productId: entry.productId,
        name: entry.product.name,
        slug: entry.product.slug,
        imageUrl: entry.product.images[0]?.url,
        category: entry.product.category.name,
        viewedAt: entry.viewedAt.toISOString(),
      })),
      notifications: user.notifications.map((entry) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        body: entry.body,
        read: Boolean(entry.readAt),
        createdAt: entry.createdAt.toISOString(),
      })),
      recommendations: user.aiRecommendations.map((entry) => ({
        productId: entry.productId,
        name: entry.product.name,
        slug: entry.product.slug,
        imageUrl: entry.product.images[0]?.url,
        score: Number(entry.score),
        reason: entry.reason,
      })),
    };
  }
}
