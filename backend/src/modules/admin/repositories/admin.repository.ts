import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { PaginationQueryDto } from "../dto/admin.dto";

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  private paginate(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  async getDashboardOverview() {
    const [
      orderStats,
      revenueAgg,
      customerCount,
      vendorCount,
      productCount,
      lowStockCount,
      recentOrders,
      recentActivities,
      topProducts,
      topCategories,
      systemHealth,
    ] = await Promise.all([
      this.prisma.order.groupBy({ by: ["status"], _count: true }),
      this.prisma.order.aggregate({
        where: { status: { notIn: ["CANCELLED", "DRAFT", "PENDING_PAYMENT"] } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.user.count({ where: { deletedAt: null, roles: { some: { role: { slug: "customer" } } } } }),
      this.prisma.vendor.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.inventoryItem.count({ where: { availableQuantity: { lte: 5 } } }),
      this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { include: { profile: true } }, items: true },
      }),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
      this.prisma.orderItem.groupBy({
        by: ["productNameSnapshot"],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: 6,
      }),
      this.prisma.product.groupBy({
        by: ["categoryId"],
        _count: true,
        orderBy: { _count: { categoryId: "desc" } },
        take: 6,
      }),
      this.prisma.dashboardMetric.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    const categoryIds = topCategories.map((entry) => entry.categoryId);
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
      : [];
    const categoryMap = new Map(categories.map((entry) => [entry.id, entry.name]));

    const salesSeries = await this.prisma.$queryRaw<Array<{ day: Date; revenue: number; orders: bigint }>>`
      SELECT date_trunc('day', created_at) AS day,
             COALESCE(SUM(grand_total), 0)::float AS revenue,
             COUNT(*)::bigint AS orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status NOT IN ('CANCELLED', 'DRAFT')
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const trafficSources = await this.prisma.analyticsEvent.groupBy({
      by: ["eventName"],
      _count: true,
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { _count: { eventName: "desc" } },
      take: 6,
    });

    return {
      orderStats,
      revenueAgg,
      customerCount,
      vendorCount,
      productCount,
      lowStockCount,
      recentOrders,
      recentActivities,
      topProducts,
      topCategories: topCategories.map((entry) => ({
        categoryId: entry.categoryId,
        name: categoryMap.get(entry.categoryId) ?? "Unknown",
        count: entry._count,
      })),
      systemHealth,
      salesSeries: salesSeries.map((entry) => ({
        day: entry.day.toISOString(),
        revenue: Number(entry.revenue),
        orders: Number(entry.orders),
      })),
      trafficSources: trafficSources.map((entry) => ({
        source: entry.eventName,
        visits: entry._count,
      })),
    };
  }

  listProducts(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumProductStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: {
          category: true,
          brand: true,
          store: true,
          images: { where: { isPrimary: true }, take: 1 },
          variants: { take: 1 },
          _count: { select: { variants: true, images: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getProduct(id: string) {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        brand: true,
        store: { include: { vendor: true } },
        variants: { include: { inventoryItems: true } },
        images: { orderBy: { sortOrder: "asc" } },
        models3d: true,
        collectionProducts: { include: { collection: true } },
        productAttributes: { include: { attribute: true, attributeValue: true } },
      },
    });
  }

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: { category: true, brand: true, store: true } });
  }

  updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data, include: { category: true, brand: true, store: true } });
  }

  softDeleteProduct(id: string) {
    return this.prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  }

  bulkUpdateProductStatus(ids: string[], status: "ACTIVE" | "ARCHIVED" | "DRAFT") {
    return this.prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
  }

  listCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { parent: true, _count: { select: { products: true, children: true } } },
    });
  }

  createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  listBrands() {
    return this.prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  createBrand(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({ data });
  }

  listCollections() {
    return this.prisma.collection.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  listInventory(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.InventoryItemWhereInput = query.search
      ? { variant: { OR: [{ sku: { contains: query.search, mode: "insensitive" } }, { product: { name: { contains: query.search, mode: "insensitive" } } }] } }
      : {};

    return Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take,
        orderBy: { availableQuantity: "asc" },
        include: { variant: { include: { product: true } }, warehouse: true },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listOrders(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.OrderWhereInput = {
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: "insensitive" } },
              { user: { email: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumOrderStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { include: { profile: true } },
          items: true,
          shipments: true,
          invoices: true,
          returns: true,
          refunds: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getOrder(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true, addresses: true } },
        items: { include: { variant: true } },
        shipments: { include: { trackingEvents: { orderBy: { occurredAt: "asc" } } } },
        invoices: true,
        payments: { include: { transactions: true } },
        returns: true,
        refunds: true,
        store: { include: { vendor: true } },
      },
    });
  }

  updateOrderStatus(id: string, status: Prisma.OrderUpdateInput["status"]) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  listCustomers(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      roles: { some: { role: { slug: "customer" } } },
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { profile: { firstName: { contains: query.search, mode: "insensitive" } } },
              { profile: { lastName: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumUserStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          orders: { orderBy: { createdAt: "desc" }, take: 3 },
          rewardPoints: true,
          wishlists: { include: { _count: { select: { items: true } } } },
        },
      }),
      this.prisma.user.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getCustomer(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: true,
        addresses: true,
        orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
        rewardPoints: { orderBy: { createdAt: "desc" } },
        wishlists: { include: { items: true, _count: { select: { items: true } } } },
        notifications: { orderBy: { createdAt: "desc" }, take: 10 },
        roles: { include: { role: true } },
      },
    });
  }

  updateCustomerStatus(id: string, status: Prisma.UserUpdateInput["status"]) {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  listVendors(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { displayName: { contains: query.search, mode: "insensitive" } },
              { legalName: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumVendorStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          stores: true,
          vendorUsers: { include: { user: { include: { profile: true } } } },
          subscriptions: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      this.prisma.vendor.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getVendor(id: string) {
    return this.prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: {
        stores: { include: { products: { take: 5, orderBy: { createdAt: "desc" } } } },
        vendorUsers: { include: { user: { include: { profile: true } } } },
        subscriptions: true,
      },
    });
  }

  updateVendor(id: string, data: Prisma.VendorUpdateInput) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  listCoupons(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.CouponWhereInput = query.search
      ? { code: { contains: query.search, mode: "insensitive" } }
      : {};

    return Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { redemptions: true } } },
      }),
      this.prisma.coupon.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  createCoupon(data: Prisma.CouponCreateInput) {
    return this.prisma.coupon.create({ data });
  }

  listGiftCards(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.GiftCardWhereInput = {};

    return Promise.all([
      this.prisma.giftCard.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { transactions: { take: 3, orderBy: { createdAt: "desc" } } },
      }),
      this.prisma.giftCard.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  createGiftCard(data: Prisma.GiftCardCreateInput) {
    return this.prisma.giftCard.create({ data });
  }

  listCampaigns() {
    return this.prisma.marketingCampaign.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  listBanners() {
    return this.prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  listCmsPages(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.cmsPage.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: { translations: true },
      }),
      this.prisma.cmsPage.count({ where: { deletedAt: null } }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  createCmsPage(data: Prisma.CmsPageCreateInput) {
    return this.prisma.cmsPage.create({ data });
  }

  listBlogs(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.blog.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { publishedAt: "desc" },
        include: { category: true },
      }),
      this.prisma.blog.count({ where: { deletedAt: null } }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  createBlog(data: Prisma.BlogCreateInput) {
    return this.prisma.blog.create({ data });
  }

  getDefaultBlogCategory() {
    return this.prisma.blogCategory.findFirst({ orderBy: { createdAt: "asc" } });
  }

  listFaqs() {
    return this.prisma.faq.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  listRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: { rolePermissions: { include: { permission: true } }, _count: { select: { userRoles: true } } },
      orderBy: { name: "asc" },
    });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] });
  }

  listAdmins(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      roles: { some: { role: { type: { in: ["SUPER_ADMIN", "ADMIN"] } } } },
    };

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { profile: true, roles: { include: { role: true } } },
      }),
      this.prisma.user.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listAuditLogs(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.auditLog.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.auditLog.count(),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listActivityLogs(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.activityLog.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.activityLog.count(),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listSecurityLogs(query: PaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.securityLog.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.securityLog.count(),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  updateFeatureFlag(key: string, enabled: boolean) {
    return this.prisma.featureFlag.update({ where: { key }, data: { enabled } });
  }

  listSettings() {
    return this.prisma.applicationSetting.findMany({ orderBy: { key: "asc" } });
  }

  upsertSetting(key: string, value: Prisma.InputJsonValue) {
    return this.prisma.applicationSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  listLanguages() {
    return this.prisma.language.findMany({ orderBy: { name: "asc" } });
  }

  listCurrencies() {
    return this.prisma.currency.findMany({ orderBy: { code: "asc" } });
  }

  listTaxRates() {
    return this.prisma.taxRate.findMany({ orderBy: { taxName: "asc" }, include: { country: true } });
  }

  listShippingZones() {
    return this.prisma.shippingZone.findMany({
      orderBy: { name: "asc" },
      include: { country: true, city: true },
    });
  }

  listPaymentMethods() {
    return this.prisma.applicationSetting.findMany({
      where: { key: { startsWith: "payment." } },
      orderBy: { key: "asc" },
    });
  }

  getAiInsights() {
    return Promise.all([
      this.prisma.aiRecommendation.groupBy({
        by: ["productId"],
        _avg: { score: true },
        _count: true,
        orderBy: { _count: { productId: "desc" } },
        take: 8,
      }),
      this.prisma.analyticsEvent.count({
        where: { eventName: "fraud_signal", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.inventoryItem.aggregate({ _sum: { availableQuantity: true }, _count: true }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        _avg: { grandTotal: true },
        _count: true,
      }),
    ]);
  }

  getProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, slug: true },
    });
  }

  getSupportStats() {
    return Promise.all([
      this.prisma.return.count({ where: { status: "REQUESTED" } }),
      this.prisma.review.count({ where: { status: "PENDING" } }),
    ]);
  }

  getReportData(reportType: string) {
    switch (reportType) {
      case "revenue":
        return this.prisma.order.findMany({
          where: { status: { notIn: ["CANCELLED", "DRAFT"] } },
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { orderNumber: true, grandTotal: true, status: true, createdAt: true, currencyCode: true },
        });
      case "customers":
        return this.prisma.user.findMany({
          where: { deletedAt: null },
          take: 500,
          include: { profile: true, _count: { select: { orders: true } } },
        });
      case "inventory":
        return this.prisma.inventoryItem.findMany({
          take: 500,
          include: { variant: { include: { product: true } }, warehouse: true },
        });
      case "vendors":
        return this.prisma.vendor.findMany({
          where: { deletedAt: null },
          include: { stores: true, _count: { select: { stores: true } } },
        });
      case "marketing":
        return this.prisma.coupon.findMany({ include: { _count: { select: { redemptions: true } } } });
      default:
        return this.prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
          include: { items: true, user: { include: { profile: true } } },
        });
    }
  }
}
