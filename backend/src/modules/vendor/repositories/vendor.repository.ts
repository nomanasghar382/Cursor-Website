import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { VendorPaginationQueryDto } from "../dto/vendor.dto";

@Injectable()
export class VendorRepository {
  constructor(private readonly prisma: PrismaService) {}

  private paginate(query: VendorPaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  getVendorContext(vendorIds: string[]) {
    return this.prisma.vendor.findMany({
      where: { id: { in: vendorIds }, deletedAt: null },
      include: {
        stores: { where: { deletedAt: null }, include: { defaultCurrency: true } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        vendorUsers: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  getStore(storeId: string) {
    return this.prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
      include: { vendor: true, defaultCurrency: true, warehouses: true, _count: { select: { products: true, orders: true } } },
    });
  }

  updateStore(storeId: string, data: Prisma.StoreUpdateInput) {
    return this.prisma.store.update({ where: { id: storeId }, data });
  }

  async getDashboard(storeIds: string[]) {
    const [
      revenueAgg,
      orderStats,
      pendingOrders,
      recentOrders,
      lowStock,
      productCount,
      reviewStats,
      notifications,
      topProducts,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { storeId: { in: storeIds }, status: { notIn: ["CANCELLED", "DRAFT", "PENDING_PAYMENT"] } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ["status"],
        where: { storeId: { in: storeIds } },
        _count: true,
      }),
      this.prisma.order.findMany({
        where: { storeId: { in: storeIds }, status: { in: ["CONFIRMED", "PROCESSING", "PENDING_PAYMENT"] } },
        orderBy: { createdAt: "asc" },
        take: 8,
        include: { user: { include: { profile: true } }, items: true },
      }),
      this.prisma.order.findMany({
        where: { storeId: { in: storeIds } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { include: { profile: true } }, items: true },
      }),
      this.prisma.inventoryItem.findMany({
        where: { availableQuantity: { lte: 5 }, variant: { product: { storeId: { in: storeIds } } } },
        take: 10,
        include: { variant: { include: { product: true } }, warehouse: true },
      }),
      this.prisma.product.count({ where: { storeId: { in: storeIds }, deletedAt: null } }),
      this.prisma.review.aggregate({
        where: { product: { storeId: { in: storeIds } } },
        _avg: { rating: true },
        _count: true,
      }),
      this.prisma.notification.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      this.prisma.orderItem.groupBy({
        by: ["productNameSnapshot"],
        where: { order: { storeId: { in: storeIds } } },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: 6,
      }),
    ]);

    const salesSeries = await this.prisma.$queryRaw<Array<{ day: Date; revenue: number; orders: bigint }>>`
      SELECT date_trunc('day', created_at) AS day,
             COALESCE(SUM(grand_total), 0)::float AS revenue,
             COUNT(*)::bigint AS orders
      FROM orders
      WHERE store_id = ANY(${storeIds}::uuid[])
        AND created_at >= NOW() - INTERVAL '30 days'
        AND status NOT IN ('CANCELLED', 'DRAFT')
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return {
      revenueAgg,
      orderStats,
      pendingOrders,
      recentOrders,
      lowStock,
      productCount,
      reviewStats,
      notifications,
      topProducts,
      salesSeries: salesSeries.map((entry) => ({
        day: entry.day.toISOString(),
        revenue: Number(entry.revenue),
        orders: Number(entry.orders),
      })),
    };
  }

  listProducts(storeIds: string[], query: VendorPaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.ProductWhereInput = {
      storeId: { in: storeIds },
      deletedAt: null,
      ...(query.search
        ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }] }
        : {}),
      ...(query.status ? { status: query.status as never } : {}),
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
          images: { where: { isPrimary: true }, take: 1 },
          variants: { take: 1 },
          models3d: { take: 1 },
          _count: { select: { variants: true, images: true, videos: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getProduct(storeIds: string[], productId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, storeId: { in: storeIds }, deletedAt: null },
      include: {
        category: true,
        brand: true,
        variants: { include: { inventoryItems: true } },
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        models3d: true,
        productAttributes: { include: { attribute: true, attributeValue: true } },
      },
    });
  }

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  updateProduct(productId: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id: productId }, data });
  }

  softDeleteProduct(productId: string) {
    return this.prisma.product.update({ where: { id: productId }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  }

  bulkUpdateProducts(ids: string[], status: "ACTIVE" | "ARCHIVED") {
    return this.prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
  }

  listInventory(storeIds: string[], query: VendorPaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.InventoryItemWhereInput = {
      variant: { product: { storeId: { in: storeIds } } },
      ...(query.search
        ? { variant: { OR: [{ sku: { contains: query.search, mode: "insensitive" } }, { product: { name: { contains: query.search, mode: "insensitive" } } }] } }
        : {}),
    };

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

  listOrders(storeIds: string[], query: VendorPaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.OrderWhereInput = {
      storeId: { in: storeIds },
      ...(query.search
        ? { OR: [{ orderNumber: { contains: query.search, mode: "insensitive" } }, { user: { email: { contains: query.search, mode: "insensitive" } } }] }
        : {}),
      ...(query.status ? { status: query.status as never } : {}),
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
          shipments: { include: { trackingEvents: true } },
          invoices: true,
          returns: true,
          refunds: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getOrder(storeIds: string[], orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, storeId: { in: storeIds } },
      include: {
        user: { include: { profile: true, addresses: true } },
        items: { include: { variant: true, product: true } },
        shipments: { include: { trackingEvents: { orderBy: { occurredAt: "asc" } } } },
        invoices: true,
        payments: { include: { transactions: true } },
        returns: true,
        refunds: true,
      },
    });
  }

  updateOrderStatus(orderId: string, status: Prisma.OrderUpdateInput["status"]) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  async listCustomers(storeIds: string[], query: VendorPaginationQueryDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const orders = await this.prisma.order.findMany({
      where: { storeId: { in: storeIds } },
      distinct: ["userId"],
      select: { userId: true },
    });
    const userIds = orders.map((entry) => entry.userId);
    const where: Prisma.UserWhereInput = {
      id: { in: userIds },
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { profile: { firstName: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          orders: { where: { storeId: { in: storeIds } }, orderBy: { createdAt: "desc" }, take: 3 },
        },
      }),
      this.prisma.user.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getCustomer(storeIds: string[], userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        profile: true,
        orders: { where: { storeId: { in: storeIds } }, include: { items: true }, orderBy: { createdAt: "desc" } },
      },
    });
  }

  listReviews(storeIds: string[]) {
    return this.prisma.review.findMany({
      where: { product: { storeId: { in: storeIds } } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: true, user: { include: { profile: true } } },
    });
  }

  getPayoutData(storeIds: string[]) {
    return Promise.all([
      this.prisma.order.findMany({
        where: { storeId: { in: storeIds }, status: { in: ["DELIVERED", "SHIPPED", "CONFIRMED"] } },
        include: { payments: true, invoices: true, store: { include: { vendor: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      this.prisma.payment.findMany({
        where: { order: { storeId: { in: storeIds } } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { order: true, transactions: true },
      }),
      this.prisma.invoice.findMany({
        where: { order: { storeId: { in: storeIds } } },
        orderBy: { issuedAt: "desc" },
        take: 50,
        include: { order: true },
      }),
    ]);
  }

  getAnalytics(storeIds: string[]) {
    return Promise.all([
      this.prisma.order.aggregate({
        where: { storeId: { in: storeIds }, status: { notIn: ["CANCELLED", "DRAFT"] } },
        _sum: { grandTotal: true, discountTotal: true },
        _count: true,
        _avg: { grandTotal: true },
      }),
      this.prisma.analyticsEvent.count({
        where: { product: { storeId: { in: storeIds } }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.order.findMany({
        where: { storeId: { in: storeIds } },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { grandTotal: true, status: true, createdAt: true, userId: true },
      }),
      this.prisma.inventoryItem.findMany({
        where: { variant: { product: { storeId: { in: storeIds } } } },
        include: { variant: { include: { product: true } } },
      }),
    ]);
  }

  listCategories() {
    return this.prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  }

  listBrands() {
    return this.prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  }
}
