import { Injectable } from "@nestjs/common";
import { AdminRepository } from "../repositories/admin.repository";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getOverview() {
    const data = await this.adminRepository.getDashboardOverview();
    const totalRevenue = Number(data.revenueAgg._sum.grandTotal ?? 0);
    const totalOrders = data.revenueAgg._count;
    const conversionRate = data.customerCount > 0 ? Number(((totalOrders / data.customerCount) * 100).toFixed(2)) : 0;

    return {
      executive: {
        revenue: totalRevenue,
        orders: totalOrders,
        customers: data.customerCount,
        vendors: data.vendorCount,
        products: data.productCount,
        conversionRate,
        lowStockAlerts: data.lowStockCount,
      },
      orderBreakdown: data.orderStats.map((entry) => ({ status: entry.status, count: entry._count })),
      salesSeries: data.salesSeries,
      trafficSources: data.trafficSources,
      topProducts: data.topProducts.map((entry) => ({
        name: entry.productNameSnapshot,
        units: entry._sum.quantity ?? 0,
        revenue: Number(entry._sum.lineTotal ?? 0),
      })),
      topCategories: data.topCategories,
      latestOrders: data.recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        grandTotal: Number(order.grandTotal),
        customer: order.user.profile
          ? `${order.user.profile.firstName ?? ""} ${order.user.profile.lastName ?? ""}`.trim()
          : order.user.email,
        itemCount: order.items.length,
        createdAt: order.createdAt.toISOString(),
      })),
      recentActivities: data.recentActivities.map((entry) => ({
        id: entry.id,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorUserId: entry.actorUserId,
        createdAt: entry.createdAt.toISOString(),
      })),
      systemHealth: data.systemHealth.map((metric) => ({
        key: metric.metricKey,
        dimension: metric.dimensionKey,
        value: Number(metric.metricValue),
        windowStart: metric.windowStart.toISOString(),
        windowEnd: metric.windowEnd.toISOString(),
      })),
    };
  }

  async getAiInsights() {
    const [recommendations, fraudSignals, inventory, orders] = await this.adminRepository.getAiInsights();
    const [openReturns, pendingReviews] = await this.adminRepository.getSupportStats();
    const products = await this.adminRepository.getProductsByIds(recommendations.map((entry) => entry.productId));
    const productMap = new Map(products.map((entry) => [entry.id, entry]));

    return {
      salesForecast: {
        projectedRevenue: Number(orders._avg.grandTotal ?? 0) * Number(orders._count ?? 0) * 1.08,
        confidence: 0.86,
        horizonDays: 30,
      },
      inventoryPrediction: {
        trackedSkus: inventory._count,
        availableUnits: Number(inventory._sum?.availableQuantity ?? 0),
        reorderRisk: Number(inventory._sum?.availableQuantity ?? 0) < 100 ? "elevated" : "stable",
      },
      fraudDetection: {
        signalsLast7Days: fraudSignals,
        riskLevel: fraudSignals > 10 ? "high" : fraudSignals > 0 ? "medium" : "low",
      },
      productPerformance: recommendations.map((entry) => ({
        productId: entry.productId,
        name: productMap.get(entry.productId)?.name ?? "Product",
        slug: productMap.get(entry.productId)?.slug,
        averageScore: Number(entry._avg.score ?? 0),
        recommendationCount: entry._count,
      })),
      marketingSuggestions: [
        "Increase retargeting on top-performing categories with conversion lift above 12%.",
        "Bundle low-velocity inventory with high AI match-score products.",
        "Launch win-back campaign for customers with 2+ fulfilled orders and 60-day inactivity.",
      ],
      supportAnalytics: { openReturns, pendingReviews },
    };
  }
}
