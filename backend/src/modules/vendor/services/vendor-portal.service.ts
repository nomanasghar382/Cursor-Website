import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import {
  AiGenerateDto,
  CreateVendorProductDto,
  UpdateStoreDto,
  UpdateVendorOrderStatusDto,
  UpdateVendorProductDto,
  VendorExportReportDto,
  VendorPaginationQueryDto,
} from "../dto/vendor.dto";
import { VendorRepository } from "../repositories/vendor.repository";
import { assertVendorRole, resolveVendorStoreIds } from "../utils/vendor-scope.util";

@Injectable()
export class VendorPortalService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  private stores(user: AuthenticatedUser, storeId?: string) {
    assertVendorRole(user);
    return resolveVendorStoreIds(user, storeId);
  }

  async getDashboard(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const data = await this.vendorRepository.getDashboard(storeIds);
    const revenue = Number(data.revenueAgg._sum.grandTotal ?? 0);
    const orders = data.revenueAgg._count;
    const healthScore = Math.min(
      100,
      Math.round(
        (data.productCount > 0 ? 25 : 0) +
          (orders > 0 ? 25 : 0) +
          (Number(data.reviewStats._avg.rating ?? 0) / 5) * 25 +
          (data.lowStock.length === 0 ? 25 : Math.max(0, 25 - data.lowStock.length * 3)),
      ),
    );

    return {
      executive: {
        revenue,
        orders,
        products: data.productCount,
        averageRating: Number(data.reviewStats._avg.rating ?? 0),
        reviewCount: data.reviewStats._count,
        healthScore,
        lowStockAlerts: data.lowStock.length,
      },
      orderBreakdown: data.orderStats.map((entry) => ({ status: entry.status, count: entry._count })),
      salesSeries: data.salesSeries,
      pendingOrders: data.pendingOrders.map((order) => this.mapOrder(order)),
      recentOrders: data.recentOrders.map((order) => this.mapOrder(order)),
      lowStockAlerts: data.lowStock.map((item) => ({
        id: item.id,
        productName: item.variant.product.name,
        sku: item.variant.sku,
        warehouse: item.warehouse.name,
        available: item.availableQuantity,
      })),
      topProducts: data.topProducts.map((entry) => ({
        name: entry.productNameSnapshot,
        units: entry._sum.quantity ?? 0,
        revenue: Number(entry._sum.lineTotal ?? 0),
      })),
      notifications: data.notifications.map((entry) => ({
        id: entry.id,
        title: entry.title,
        body: entry.body,
        createdAt: entry.createdAt.toISOString(),
      })),
      quickActions: [
        { label: "Create product", href: "/vendor/products" },
        { label: "Process orders", href: "/vendor/orders" },
        { label: "View payouts", href: "/vendor/payouts" },
        { label: "Store settings", href: "/vendor/store" },
      ],
    };
  }

  async getAiInsights(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const [analytics, lowStock, topProducts] = await Promise.all([
      this.vendorRepository.getAnalytics(storeIds),
      this.vendorRepository.getDashboard(storeIds),
      this.vendorRepository.listProducts(storeIds, { limit: 5 }),
    ]);

    const [orderAgg, visitors, orders] = analytics;
    const avgOrder = Number(orderAgg._avg.grandTotal ?? 0);

    return {
      salesForecast: {
        projectedRevenue: avgOrder * orderAgg._count * 1.12,
        horizonDays: 30,
        confidence: 0.84,
      },
      inventoryPrediction: {
        lowStockSkus: lowStock.lowStock.length,
        recommendation: lowStock.lowStock.length > 0 ? "Replenish flagged SKUs within 72 hours." : "Inventory levels are stable.",
      },
      pricingSuggestions: topProducts.items.slice(0, 3).map((product) => ({
        productId: product.id,
        name: product.name,
        currentPrice: Number(product.basePrice),
        suggestedPrice: Number(product.basePrice) * (Number(product.aiScore) > 90 ? 1.05 : 0.97),
        reason: Number(product.aiScore) > 90 ? "High AI demand score supports premium pricing." : "Competitive repositioning recommended.",
      })),
      marketingSuggestions: [
        "Launch a bundle offer pairing your top revenue SKU with a complementary accessory.",
        "Enable back-in-stock alerts for low inventory hero products.",
        "Refresh hero gallery assets for products with conversion dips.",
      ],
      customerInsights: {
        uniqueBuyers: new Set(orders.map((order) => order.userId)).size,
        visitorSignals: visitors,
        repeatPurchaseRate: orders.length > 0 ? Number(((orders.length / Math.max(new Set(orders.map((o) => o.userId)).size, 1)) * 10).toFixed(1)) : 0,
      },
    };
  }

  async getStore(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const store = await this.vendorRepository.getStore(storeIds[0]);
    if (!store) throw new NotFoundException("Store not found.");
    const metadata = (store.metadata ?? {}) as Record<string, unknown>;
    return {
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logoUrl: store.logoUrl,
        status: store.status,
        currency: store.defaultCurrency.code,
        productCount: store._count.products,
        orderCount: store._count.orders,
        vendor: {
          id: store.vendor.id,
          displayName: store.vendor.displayName,
          status: store.vendor.status,
          kycStatus: store.vendor.kycStatus,
        },
        seoTitle: (metadata.seoTitle as string) ?? store.name,
        seoDescription: (metadata.seoDescription as string) ?? store.description,
        bannerUrl: (metadata.bannerUrl as string) ?? null,
        policies: (metadata.policies as Record<string, string>) ?? {},
        vacationMode: Boolean(metadata.vacationMode),
        theme: (metadata.theme as string) ?? "novaex-premium",
      },
    };
  }

  async updateStore(user: AuthenticatedUser, dto: UpdateStoreDto, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const existing = await this.vendorRepository.getStore(storeIds[0]);
    if (!existing) throw new NotFoundException("Store not found.");
    const metadata = {
      ...((existing.metadata ?? {}) as Record<string, unknown>),
      ...(dto.seoTitle ? { seoTitle: dto.seoTitle } : {}),
      ...(dto.seoDescription ? { seoDescription: dto.seoDescription } : {}),
      ...(dto.bannerUrl ? { bannerUrl: dto.bannerUrl } : {}),
      ...(dto.policies ? { policies: dto.policies } : {}),
      ...(dto.vacationMode !== undefined ? { vacationMode: dto.vacationMode } : {}),
      ...(dto.status === "vacation" ? { vacationMode: true } : {}),
    };

    const store = await this.vendorRepository.updateStore(storeIds[0], {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.logoUrl ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.status && dto.status !== "vacation" ? { status: dto.status as never } : {}),
      metadata: metadata as Prisma.InputJsonValue,
    });

    return this.getStore(user, store.id);
  }

  listProducts(user: AuthenticatedUser, query: VendorPaginationQueryDto) {
    const storeIds = this.stores(user, query.storeId);
    return this.vendorRepository.listProducts(storeIds, query).then((result) => ({
      ...result,
      products: result.items.map((product) => this.mapProduct(product)),
    }));
  }

  async getProduct(user: AuthenticatedUser, productId: string, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const product = await this.vendorRepository.getProduct(storeIds, productId);
    if (!product) throw new NotFoundException("Product not found.");
    return { product: this.mapProduct(product) };
  }

  async createProduct(user: AuthenticatedUser, dto: CreateVendorProductDto) {
    const storeIds = this.stores(user, dto.storeId);
    if (!storeIds.includes(dto.storeId)) throw new NotFoundException("Store not found.");

    const product = await this.vendorRepository.createProduct({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      basePrice: dto.basePrice,
      currencyCode: dto.currencyCode ?? "USD",
      status: "DRAFT",
      store: { connect: { id: dto.storeId } },
      category: { connect: { id: dto.categoryId } },
      ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
      metadata: {
        seoTitle: dto.seoTitle ?? dto.name,
        seoDescription: dto.seoDescription ?? dto.description.slice(0, 160),
      },
    });

    return { product: this.mapProduct(product) };
  }

  async updateProduct(user: AuthenticatedUser, productId: string, dto: UpdateVendorProductDto, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const existing = await this.vendorRepository.getProduct(storeIds, productId);
    if (!existing) throw new NotFoundException("Product not found.");

    const metadata = {
      ...((existing.metadata ?? {}) as Record<string, unknown>),
      ...(dto.seoTitle ? { seoTitle: dto.seoTitle } : {}),
      ...(dto.seoDescription ? { seoDescription: dto.seoDescription } : {}),
    };

    const product = await this.vendorRepository.updateProduct(productId, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
      ...(dto.status ? { status: dto.status as never } : {}),
      metadata: metadata as Prisma.InputJsonValue,
    });

    return { product: this.mapProduct(product) };
  }

  async deleteProduct(user: AuthenticatedUser, productId: string, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const existing = await this.vendorRepository.getProduct(storeIds, productId);
    if (!existing) throw new NotFoundException("Product not found.");
    await this.vendorRepository.softDeleteProduct(productId);
    return { deleted: true };
  }

  listInventory(user: AuthenticatedUser, query: VendorPaginationQueryDto) {
    const storeIds = this.stores(user, query.storeId);
    return this.vendorRepository.listInventory(storeIds, query).then((result) => ({
      ...result,
      inventory: result.items.map((item) => ({
        id: item.id,
        sku: item.variant.sku,
        productName: item.variant.product.name,
        warehouse: item.warehouse.name,
        available: item.availableQuantity,
        reserved: item.reservedQuantity,
      })),
    }));
  }

  listOrders(user: AuthenticatedUser, query: VendorPaginationQueryDto) {
    const storeIds = this.stores(user, query.storeId);
    return this.vendorRepository.listOrders(storeIds, query).then((result) => ({
      ...result,
      orders: result.items.map((order) => this.mapOrder(order)),
    }));
  }

  async getOrder(user: AuthenticatedUser, orderId: string, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const order = await this.vendorRepository.getOrder(storeIds, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    return {
      order: {
        ...this.mapOrder(order),
        items: order.items,
        shipments: order.shipments,
        invoices: order.invoices,
        returns: order.returns,
        refunds: order.refunds,
        payments: order.payments,
        timeline: this.buildTimeline(order.status),
      },
    };
  }

  async updateOrderStatus(user: AuthenticatedUser, orderId: string, dto: UpdateVendorOrderStatusDto, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const order = await this.vendorRepository.getOrder(storeIds, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    const updated = await this.vendorRepository.updateOrderStatus(orderId, dto.status as never);
    return { order: this.mapOrder(updated) };
  }

  async listCustomers(user: AuthenticatedUser, query: VendorPaginationQueryDto) {
    const storeIds = this.stores(user, query.storeId);
    const result = await this.vendorRepository.listCustomers(storeIds, query);
    return {
      ...result,
      customers: result.items.map((customer) => ({
        id: customer.id,
        email: customer.email,
        name: customer.profile ? `${customer.profile.firstName ?? ""} ${customer.profile.lastName ?? ""}`.trim() : customer.email,
        phone: null,
        orderCount: customer.orders.length,
        createdAt: customer.createdAt.toISOString(),
      })),
    };
  }

  async getCustomer(user: AuthenticatedUser, customerId: string, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const customer = await this.vendorRepository.getCustomer(storeIds, customerId);
    if (!customer) throw new NotFoundException("Customer not found.");
    return {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.profile ? `${customer.profile.firstName ?? ""} ${customer.profile.lastName ?? ""}`.trim() : customer.email,
        orders: customer.orders.map((order) => this.mapOrder(order)),
      },
    };
  }

  listReviews(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    return this.vendorRepository.listReviews(storeIds).then((reviews) => ({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        status: review.status,
        productName: review.product.name,
        customer: review.user.profile
          ? `${review.user.profile.firstName ?? ""} ${review.user.profile.lastName ?? ""}`.trim()
          : review.user.email,
        createdAt: review.createdAt.toISOString(),
      })),
    }));
  }

  async getPayouts(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const [orders, payments, invoices] = await this.vendorRepository.getPayoutData(storeIds);
    const commissionRate = 0.15;
    const grossRevenue = orders.reduce((sum, order) => sum + Number(order.grandTotal), 0);
    const commission = grossRevenue * commissionRate;
    const netEarnings = grossRevenue - commission;

    return {
      earnings: {
        grossRevenue,
        commission,
        commissionRate,
        netEarnings,
        pendingSettlement: orders.filter((order) => order.status === "SHIPPED").reduce((sum, order) => sum + Number(order.grandTotal), 0),
      },
      architecture: ["STRIPE_CONNECT", "WEEKLY_SETTLEMENT", "INVOICE_RECONCILIATION"],
      transactions: payments.map((payment) => ({
        id: payment.id,
        orderNumber: payment.order.orderNumber,
        status: payment.status,
        amount: Number(payment.amount),
        createdAt: payment.createdAt.toISOString(),
      })),
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderNumber: invoice.order.orderNumber,
        issuedAt: invoice.issuedAt?.toISOString(),
      })),
      commissionReports: orders.slice(0, 20).map((order) => ({
        orderNumber: order.orderNumber,
        gross: Number(order.grandTotal),
        commission: Number(order.grandTotal) * commissionRate,
        net: Number(order.grandTotal) * (1 - commissionRate),
      })),
    };
  }

  requestPayout(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    return {
      requested: true,
      storeId: storeIds[0],
      message: "Payout request queued for the next settlement window.",
      settlementWindow: "weekly",
    };
  }

  async getAnalytics(user: AuthenticatedUser, storeId?: string) {
    const storeIds = this.stores(user, storeId);
    const [orderAgg, visitors, orders, inventory] = await this.vendorRepository.getAnalytics(storeIds);
    const uniqueCustomers = new Set(orders.map((order) => order.userId)).size;

    return {
      revenue: Number(orderAgg._sum.grandTotal ?? 0),
      profit: Number(orderAgg._sum.grandTotal ?? 0) - Number(orderAgg._sum.discountTotal ?? 0),
      orders: orderAgg._count,
      visitors,
      conversionRate: visitors > 0 ? Number(((orderAgg._count / visitors) * 100).toFixed(2)) : 0,
      averageOrderValue: Number(orderAgg._avg.grandTotal ?? 0),
      customerGrowth: uniqueCustomers,
      inventorySkus: inventory.length,
      salesTrend: orders.slice(0, 30).map((order) => ({
        date: order.createdAt.toISOString(),
        amount: Number(order.grandTotal),
        status: order.status,
      })),
    };
  }

  async exportReport(user: AuthenticatedUser, dto: VendorExportReportDto) {
    const storeIds = this.stores(user, dto.storeId);
    const analytics = await this.getAnalytics(user, dto.storeId);
    const rows =
      dto.reportType === "inventory"
        ? (await this.vendorRepository.listInventory(storeIds, { limit: 500 })).items
        : dto.reportType === "customers"
          ? (await this.vendorRepository.listCustomers(storeIds, { limit: 500 })).items
          : analytics.salesTrend;

    if (dto.format === "json") return { format: "json", rows };
    const headers = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : ["message"];
    const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify((row as Record<string, unknown>)[header] ?? "")).join(","))].join("\n");
    return { format: "csv", content: csv };
  }

  generateAiContent(_user: AuthenticatedUser, dto: AiGenerateDto) {
    const tone = dto.tone ?? "premium";
    return {
      description: `${dto.productName} is engineered for discerning buyers who expect ${tone} craftsmanship, intelligent automation, and marketplace-grade reliability. Built for the NOVAEX ecosystem with adaptive AI recommendations and conversion-optimized merchandising.`,
      seoTitle: `${dto.productName} | ${dto.category ?? "Premium"} | NOVAEX Vendor Store`,
      seoDescription: `Shop ${dto.productName} with verified seller fulfillment, premium support, and AI-curated product intelligence on NOVAEX.`,
      keywords: [dto.productName, dto.category ?? "marketplace", "NOVAEX", "premium", "AI commerce"],
    };
  }

  listCatalogOptions() {
    return Promise.all([this.vendorRepository.listCategories(), this.vendorRepository.listBrands()]).then(([categories, brands]) => ({
      categories,
      brands,
    }));
  }

  private mapProduct(product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    basePrice: unknown;
    currencyCode: string;
    aiScore: unknown;
    createdAt: Date;
    updatedAt: Date;
    category?: { name: string } | null;
    brand?: { name: string } | null;
    images?: Array<{ url: string }>;
    _count?: { variants: number; images: number; videos: number };
  }) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      status: product.status,
      basePrice: Number(product.basePrice),
      currencyCode: product.currencyCode,
      aiScore: Number(product.aiScore),
      category: product.category?.name,
      brand: product.brand?.name,
      imageUrl: product.images?.[0]?.url,
      variantCount: product._count?.variants ?? 0,
      imageCount: product._count?.images ?? 0,
      videoCount: product._count?.videos ?? 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private mapOrder(order: {
    id: string;
    orderNumber: string;
    status: string;
    grandTotal: unknown;
    currencyCode: string;
    createdAt: Date;
    user?: { email: string; profile?: { firstName?: string | null; lastName?: string | null } | null };
    items?: unknown[];
  }) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: Number(order.grandTotal),
      currencyCode: order.currencyCode,
      itemCount: order.items?.length ?? 0,
      customerEmail: order.user?.email,
      customerName: order.user?.profile
        ? `${order.user.profile.firstName ?? ""} ${order.user.profile.lastName ?? ""}`.trim()
        : order.user?.email,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private buildTimeline(status: string) {
    const steps = ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      key: step,
      label: step.replaceAll("_", " "),
      completed: currentIndex > index,
      current: currentIndex === index,
    }));
  }
}
