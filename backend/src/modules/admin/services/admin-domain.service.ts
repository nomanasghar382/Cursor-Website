import { createHash } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  BulkProductActionDto,
  CreateBlogDto,
  CreateBrandDto,
  CreateCategoryDto,
  CreateCmsPageDto,
  CreateCouponDto,
  CreateGiftCardDto,
  CreateProductDto,
  ExportReportDto,
  PaginationQueryDto,
  UpdateCustomerStatusDto,
  UpdateFeatureFlagDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
  UpdateSettingDto,
  UpdateVendorStatusDto,
} from "../dto/admin.dto";
import { AdminRepository } from "../repositories/admin.repository";

@Injectable()
export class AdminCatalogService {
  constructor(private readonly adminRepository: AdminRepository) {}

  listProducts(query: PaginationQueryDto) {
    return this.adminRepository.listProducts(query).then((result) => ({
      ...result,
      products: result.items.map((product) => this.mapProduct(product)),
    }));
  }

  async getProduct(id: string) {
    const product = await this.adminRepository.getProduct(id);
    if (!product) throw new NotFoundException("Product not found.");
    return { product: this.mapProduct(product) };
  }

  createProduct(dto: CreateProductDto) {
    return this.adminRepository
      .createProduct({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        basePrice: dto.basePrice,
        currencyCode: dto.currencyCode ?? "USD",
        status: (dto.status as "DRAFT" | "ACTIVE" | "ARCHIVED") ?? "DRAFT",
        store: { connect: { id: dto.storeId } },
        category: { connect: { id: dto.categoryId } },
        ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
      })
      .then((product) => ({ product: this.mapProduct(product) }));
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.adminRepository.updateProduct(id, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
      ...(dto.status ? { status: dto.status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
      ...(dto.visibility ? { visibility: dto.visibility as "PUBLIC" | "PRIVATE" | "UNLISTED" } : {}),
    });
    return { product: this.mapProduct(product) };
  }

  async deleteProduct(id: string) {
    await this.adminRepository.softDeleteProduct(id);
    return { deleted: true };
  }

  async bulkProductAction(dto: BulkProductActionDto) {
    const statusMap = { approve: "ACTIVE", archive: "ARCHIVED", activate: "ACTIVE" } as const;
    await this.adminRepository.bulkUpdateProductStatus(dto.productIds, statusMap[dto.action]);
    return { updated: dto.productIds.length };
  }

  listCategories() {
    return this.adminRepository.listCategories().then((categories) => ({ categories }));
  }

  createCategory(dto: CreateCategoryDto) {
    return this.adminRepository
      .createCategory({
        name: dto.name,
        slug: dto.slug,
        ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
      })
      .then((category) => ({ category }));
  }

  listBrands() {
    return this.adminRepository.listBrands().then((brands) => ({ brands }));
  }

  createBrand(dto: CreateBrandDto) {
    return this.adminRepository.createBrand({ name: dto.name, slug: dto.slug }).then((brand) => ({ brand }));
  }

  listCollections() {
    return this.adminRepository.listCollections().then((collections) => ({ collections }));
  }

  listInventory(query: PaginationQueryDto) {
    return this.adminRepository.listInventory(query).then((result) => ({
      ...result,
      inventory: result.items.map((item) => ({
        id: item.id,
        sku: item.variant.sku,
        productName: item.variant.product.name,
        warehouse: item.warehouse.name,
        quantityAvailable: item.availableQuantity,
        quantityReserved: item.reservedQuantity,
      })),
    }));
  }

  private mapProduct(product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    visibility: string;
    basePrice: unknown;
    currencyCode: string;
    aiScore: unknown;
    createdAt: Date;
    updatedAt: Date;
    category?: { id: string; name: string } | null;
    brand?: { id: string; name: string } | null;
    store?: { id: string; name: string } | null;
    images?: Array<{ url: string }>;
    variants?: unknown[];
    _count?: { variants: number; images: number };
  }) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      status: product.status,
      visibility: product.visibility,
      basePrice: Number(product.basePrice),
      currencyCode: product.currencyCode,
      aiScore: Number(product.aiScore),
      category: product.category,
      brand: product.brand,
      store: product.store,
      imageUrl: product.images?.[0]?.url,
      variantCount: product._count?.variants ?? product.variants?.length ?? 0,
      imageCount: product._count?.images ?? product.images?.length ?? 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class AdminOperationsService {
  constructor(private readonly adminRepository: AdminRepository) {}

  listOrders(query: PaginationQueryDto) {
    return this.adminRepository.listOrders(query).then((result) => ({
      ...result,
      orders: result.items.map((order) => this.mapOrder(order)),
    }));
  }

  async getOrder(id: string) {
    const order = await this.adminRepository.getOrder(id);
    if (!order) throw new NotFoundException("Order not found.");
    return {
      order: {
        ...this.mapOrder(order),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productNameSnapshot,
          sku: item.skuSnapshot,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
        shipments: order.shipments,
        invoices: order.invoices,
        returns: order.returns,
        refunds: order.refunds,
        payments: order.payments,
        timeline: this.buildTimeline(order.status),
      },
    };
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.adminRepository.updateOrderStatus(id, dto.status as never);
    return { order: this.mapOrder(order) };
  }

  listCustomers(query: PaginationQueryDto) {
    return this.adminRepository.listCustomers(query).then((result) => ({
      ...result,
      customers: result.items.map((customer) => this.mapCustomer(customer)),
    }));
  }

  async getCustomer(id: string) {
    const customer = await this.adminRepository.getCustomer(id);
    if (!customer) throw new NotFoundException("Customer not found.");
    const rewardPoints = customer.rewardPoints.reduce((sum, entry) => sum + entry.pointsDelta, 0);
    return {
      customer: {
        ...this.mapCustomer(customer),
        addresses: customer.addresses,
        orders: customer.orders.map((order) => this.mapOrder(order)),
        rewardPoints,
        wishlists: customer.wishlists,
        notifications: customer.notifications,
      },
    };
  }

  async updateCustomerStatus(id: string, dto: UpdateCustomerStatusDto) {
    const customer = await this.adminRepository.updateCustomerStatus(id, dto.status as never);
    return { customer: this.mapCustomer(customer) };
  }

  listVendors(query: PaginationQueryDto) {
    return this.adminRepository.listVendors(query).then((result) => ({
      ...result,
      vendors: result.items.map((vendor) => this.mapVendor(vendor)),
    }));
  }

  async getVendor(id: string) {
    const vendor = await this.adminRepository.getVendor(id);
    if (!vendor) throw new NotFoundException("Vendor not found.");
    return { vendor: this.mapVendor(vendor) };
  }

  async updateVendorStatus(id: string, dto: UpdateVendorStatusDto) {
    const vendor = await this.adminRepository.updateVendor(id, {
      status: dto.status as never,
      ...(dto.kycStatus ? { kycStatus: dto.kycStatus as never } : {}),
    });
    return { vendor: this.mapVendor(vendor) };
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

  private mapCustomer(customer: {
    id: string;
    email: string;
    status: string;
    createdAt: Date;
    profile?: { firstName?: string | null; lastName?: string | null; phone?: string | null } | null;
    orders?: unknown[];
    wishlists?: Array<{ items?: unknown[]; _count?: { items: number } }>;
  }) {
    return {
      id: customer.id,
      email: customer.email,
      status: customer.status,
      name: customer.profile
        ? `${customer.profile.firstName ?? ""} ${customer.profile.lastName ?? ""}`.trim()
        : customer.email,
      phone: customer.profile?.phone,
      orderCount: customer.orders?.length ?? 0,
      wishlistCount: customer.wishlists?.reduce((sum, entry) => sum + (entry._count?.items ?? entry.items?.length ?? 0), 0) ?? 0,
      createdAt: customer.createdAt.toISOString(),
    };
  }

  private mapVendor(vendor: {
    id: string;
    legalName: string;
    displayName: string;
    status: string;
    kycStatus: string;
    createdAt: Date;
    stores?: unknown[];
    vendorUsers?: unknown[];
  }) {
    return {
      id: vendor.id,
      legalName: vendor.legalName,
      displayName: vendor.displayName,
      status: vendor.status,
      kycStatus: vendor.kycStatus,
      storeCount: vendor.stores?.length ?? 0,
      userCount: vendor.vendorUsers?.length ?? 0,
      createdAt: vendor.createdAt.toISOString(),
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

@Injectable()
export class AdminGrowthService {
  constructor(private readonly adminRepository: AdminRepository) {}

  listCoupons(query: PaginationQueryDto) {
    return this.adminRepository.listCoupons(query).then((result) => ({
      ...result,
      coupons: result.items.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        status: coupon.status,
        usageLimit: coupon.usageLimit,
        redemptions: coupon._count.redemptions,
        startsAt: coupon.startsAt.toISOString(),
        endsAt: coupon.endsAt?.toISOString(),
      })),
    }));
  }

  createCoupon(dto: CreateCouponDto) {
    return this.adminRepository
      .createCoupon({
        code: dto.code.toUpperCase(),
        discountType: dto.discountType as never,
        discountValue: dto.discountValue,
        usageLimit: dto.maxRedemptions,
        startsAt: new Date(),
        status: "ACTIVE",
      })
      .then((coupon) => ({ coupon }));
  }

  listGiftCards(query: PaginationQueryDto) {
    return this.adminRepository.listGiftCards(query).then((result) => ({
      ...result,
      giftCards: result.items.map((card) => ({
        id: card.id,
        initialBalance: Number(card.initialBalance),
        currentBalance: Number(card.currentBalance),
        currencyCode: card.currencyCode,
        status: card.status,
        expiresAt: card.expiresAt?.toISOString(),
      })),
    }));
  }

  createGiftCard(dto: CreateGiftCardDto) {
    const codeHash = createHash("sha256").update(dto.code).digest("hex");
    return this.adminRepository
      .createGiftCard({
        codeHash,
        initialBalance: dto.initialBalance,
        currentBalance: dto.initialBalance,
        currencyCode: dto.currencyCode ?? "USD",
        status: "ACTIVE",
      })
      .then((giftCard) => ({ giftCard }));
  }

  listCampaigns() {
    return this.adminRepository.listCampaigns().then((campaigns) => ({ campaigns }));
  }

  listBanners() {
    return this.adminRepository.listBanners().then((banners) => ({ banners }));
  }

  listCmsPages(query: PaginationQueryDto) {
    return this.adminRepository.listCmsPages(query).then((result) => ({ ...result, pages: result.items }));
  }

  createCmsPage(dto: CreateCmsPageDto) {
    return this.adminRepository
      .createCmsPage({
        slug: dto.slug,
        title: dto.title,
        content: dto.body,
        status: (dto.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
      })
      .then((page) => ({ page }));
  }

  listBlogs(query: PaginationQueryDto) {
    return this.adminRepository.listBlogs(query).then((result) => ({ ...result, blogs: result.items }));
  }

  async createBlog(dto: CreateBlogDto, authorUserId: string) {
    const category = await this.adminRepository.getDefaultBlogCategory();
    if (!category) throw new NotFoundException("Blog category is required.");
    return this.adminRepository
      .createBlog({
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.body,
        status: "DRAFT",
        author: { connect: { id: authorUserId } },
        category: { connect: { id: category.id } },
      })
      .then((blog) => ({ blog }));
  }

  listFaqs() {
    return this.adminRepository.listFaqs().then((faqs) => ({ faqs }));
  }
}

@Injectable()
export class AdminPlatformService {
  constructor(private readonly adminRepository: AdminRepository) {}

  listRoles() {
    return this.adminRepository.listRoles().then((roles) => ({ roles }));
  }

  listPermissions() {
    return this.adminRepository.listPermissions().then((permissions) => ({ permissions }));
  }

  listAdmins(query: PaginationQueryDto) {
    return this.adminRepository.listAdmins(query).then((result) => ({ ...result, admins: result.items }));
  }

  listAuditLogs(query: PaginationQueryDto) {
    return this.adminRepository.listAuditLogs(query).then((result) => ({ ...result, logs: result.items }));
  }

  listActivityLogs(query: PaginationQueryDto) {
    return this.adminRepository.listActivityLogs(query).then((result) => ({ ...result, logs: result.items }));
  }

  listSecurityLogs(query: PaginationQueryDto) {
    return this.adminRepository.listSecurityLogs(query).then((result) => ({ ...result, logs: result.items }));
  }

  listFeatureFlags() {
    return this.adminRepository.listFeatureFlags().then((flags) => ({ flags }));
  }

  updateFeatureFlag(key: string, dto: UpdateFeatureFlagDto) {
    return this.adminRepository.updateFeatureFlag(key, dto.enabled).then((flag) => ({ flag }));
  }

  listSettings() {
    return this.adminRepository.listSettings().then((settings) => ({ settings }));
  }

  updateSetting(dto: UpdateSettingDto) {
    return this.adminRepository.upsertSetting(dto.key, dto.value as never).then((setting) => ({ setting }));
  }

  listLanguages() {
    return this.adminRepository.listLanguages().then((languages) => ({ languages }));
  }

  listCurrencies() {
    return this.adminRepository.listCurrencies().then((currencies) => ({ currencies }));
  }

  listTaxRates() {
    return this.adminRepository.listTaxRates().then((taxes) => ({ taxes }));
  }

  listShippingZones() {
    return this.adminRepository.listShippingZones().then((zones) => ({ zones }));
  }

  listPaymentMethods() {
    return this.adminRepository.listPaymentMethods().then((methods) => ({
      methods,
      architecture: ["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"],
    }));
  }

  async exportReport(dto: ExportReportDto) {
    const rows = await this.adminRepository.getReportData(dto.reportType);
    if (dto.format === "json") {
      return { format: "json", rows };
    }

    const headers = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];
    const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify((row as Record<string, unknown>)[header] ?? "")).join(","))].join("\n");
    return { format: dto.format, content: dto.format === "csv" ? csv : `NOVAEX ${dto.reportType} report\n${csv}` };
  }
}
