import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { GrowthPaginationDto } from "../dto/growth.dto";

@Injectable()
export class GrowthRepository {
  constructor(private readonly prisma: PrismaService) {}

  private paginate(query: GrowthPaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  // CMS Pages
  listCmsPages(query: GrowthPaginationDto, publishedOnly = false) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.CmsPageWhereInput = {
      deletedAt: null,
      ...(publishedOnly ? { status: "PUBLISHED" } : {}),
      ...(query.status ? { status: query.status as Prisma.EnumContentStatusFilter["equals"] } : {}),
      ...(query.search
        ? { OR: [{ title: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }] }
        : {}),
    };
    return Promise.all([
      this.prisma.cmsPage.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { translations: true } }),
      this.prisma.cmsPage.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getCmsPageBySlug(slug: string, publishedOnly = false) {
    return this.prisma.cmsPage.findFirst({
      where: { slug, deletedAt: null, ...(publishedOnly ? { status: "PUBLISHED" } : {}) },
      include: { translations: true, landingPages: true },
    });
  }

  getCmsPageById(id: string) {
    return this.prisma.cmsPage.findFirst({ where: { id, deletedAt: null }, include: { translations: true, landingPages: true } });
  }

  createCmsPage(data: Prisma.CmsPageCreateInput) {
    return this.prisma.cmsPage.create({ data });
  }

  updateCmsPage(id: string, data: Prisma.CmsPageUpdateInput) {
    return this.prisma.cmsPage.update({ where: { id }, data });
  }

  softDeleteCmsPage(id: string) {
    return this.prisma.cmsPage.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // Blogs
  listBlogs(query: GrowthPaginationDto, publishedOnly = false) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.BlogWhereInput = {
      deletedAt: null,
      ...(publishedOnly ? { status: "PUBLISHED" } : {}),
      ...(query.status ? { status: query.status as Prisma.EnumContentStatusFilter["equals"] } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search
        ? { OR: [{ title: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }] }
        : {}),
    };
    return Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: { include: { profile: true } } },
      }),
      this.prisma.blog.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getBlogBySlug(slug: string, publishedOnly = false) {
    return this.prisma.blog.findFirst({
      where: { slug, deletedAt: null, ...(publishedOnly ? { status: "PUBLISHED" } : {}) },
      include: { category: true, author: { include: { profile: true } }, comments: { where: { status: "APPROVED", deletedAt: null }, take: 20 } },
    });
  }

  getBlogById(id: string) {
    return this.prisma.blog.findFirst({ where: { id, deletedAt: null }, include: { category: true, author: { include: { profile: true } } } });
  }

  createBlog(data: Prisma.BlogCreateInput) {
    return this.prisma.blog.create({ data });
  }

  updateBlog(id: string, data: Prisma.BlogUpdateInput) {
    return this.prisma.blog.update({ where: { id }, data });
  }

  softDeleteBlog(id: string) {
    return this.prisma.blog.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  listBlogCategories() {
    return this.prisma.blogCategory.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  }

  getDefaultBlogCategory() {
    return this.prisma.blogCategory.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: "asc" } });
  }

  // FAQs
  listFaqs(activeOnly = false) {
    return this.prisma.faq.findMany({
      where: { deletedAt: null, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { sortOrder: "asc" },
    });
  }

  createFaq(data: Prisma.FaqCreateInput) {
    return this.prisma.faq.create({ data });
  }

  updateFaq(id: string, data: Prisma.FaqUpdateInput) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  softDeleteFaq(id: string) {
    return this.prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // Landing pages
  listLandingPages(query: GrowthPaginationDto, publishedOnly = false) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.LandingPageWhereInput = {
      deletedAt: null,
      ...(publishedOnly ? { status: "PUBLISHED" } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }] } : {}),
    };
    return Promise.all([
      this.prisma.landingPage.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: { cmsPage: true, heroSections: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }, banners: { where: { deletedAt: null } } },
      }),
      this.prisma.landingPage.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  getLandingPageBySlug(slug: string, publishedOnly = false) {
    return this.prisma.landingPage.findFirst({
      where: { slug, deletedAt: null, ...(publishedOnly ? { status: "PUBLISHED" } : {}) },
      include: {
        cmsPage: true,
        heroSections: { where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: "asc" } },
        banners: { where: { deletedAt: null } },
      },
    });
  }

  createLandingPage(data: Prisma.LandingPageCreateInput) {
    return this.prisma.landingPage.create({ data });
  }

  updateLandingPage(id: string, data: Prisma.LandingPageUpdateInput) {
    return this.prisma.landingPage.update({ where: { id }, data });
  }

  // Marketing
  listCampaigns(query?: GrowthPaginationDto) {
    return this.prisma.marketingCampaign.findMany({
      where: { deletedAt: null, ...(query?.status ? { status: query.status as Prisma.EnumCampaignStatusFilter["equals"] } : {}) },
      orderBy: { createdAt: "desc" },
      include: { banners: true, heroSections: true },
    });
  }

  createCampaign(data: Prisma.MarketingCampaignCreateInput) {
    return this.prisma.marketingCampaign.create({ data });
  }

  updateCampaign(id: string, data: Prisma.MarketingCampaignUpdateInput) {
    return this.prisma.marketingCampaign.update({ where: { id }, data });
  }

  listBanners(placement?: string, activeOnly = false) {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        deletedAt: null,
        ...(placement ? { placement } : {}),
        ...(activeOnly ? { startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  createBanner(data: Prisma.BannerCreateInput) {
    return this.prisma.banner.create({ data });
  }

  updateBanner(id: string, data: Prisma.BannerUpdateInput) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  listHeroSections(activeOnly = false) {
    return this.prisma.heroSection.findMany({
      where: { deletedAt: null, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { sortOrder: "asc" },
    });
  }

  createHeroSection(data: Prisma.HeroSectionCreateInput) {
    return this.prisma.heroSection.create({ data });
  }

  updateHeroSection(id: string, data: Prisma.HeroSectionUpdateInput) {
    return this.prisma.heroSection.update({ where: { id }, data });
  }

  listCoupons(query: GrowthPaginationDto) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.CouponWhereInput = { deletedAt: null };
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

  listDiscountRules() {
    return this.prisma.discountRule.findMany({ where: { deletedAt: null }, orderBy: { priority: "desc" } });
  }

  listGiftCards(query: GrowthPaginationDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.giftCard.findMany({ where: {}, skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.giftCard.count(),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  createGiftCard(data: Prisma.GiftCardCreateInput) {
    return this.prisma.giftCard.create({ data });
  }

  findProductBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, status: "ACTIVE", visibility: "PUBLIC", deletedAt: null },
      include: {
        images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { where: { deletedAt: null, status: "ACTIVE" }, take: 1 },
        reviews: { where: { status: "APPROVED", deletedAt: null }, select: { rating: true } },
        translations: { take: 1 },
      },
    });
  }

  findCategoryBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: { translations: { take: 1 } },
    });
  }

  getAnalyticsEvents(options?: { eventName?: string; limit?: number }) {
    return this.prisma.analyticsEvent.findMany({
      where: options?.eventName ? { eventName: options.eventName } : undefined,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 500,
    });
  }

  // Growth programs
  listReferrals() {
    return this.prisma.referral.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }

  listAffiliates() {
    return this.prisma.affiliate.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { clicks: true, conversions: true } } },
    });
  }

  getAffiliateByCode(code: string) {
    return this.prisma.affiliate.findFirst({ where: { code, deletedAt: null, status: "active" } });
  }

  recordAffiliateClick(affiliateId: string, visitorId?: string) {
    return this.prisma.affiliateClick.create({ data: { affiliateId, visitorId } });
  }

  listRewardPoints(userId?: string) {
    return this.prisma.rewardPoint.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  // Newsletter
  subscribeNewsletter(email: string, userId?: string, source?: string) {
    return this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: { email, userId, source, status: "subscribed" },
      update: { status: "subscribed", source, deletedAt: null },
    });
  }

  listNewsletterSubscriptions(query: GrowthPaginationDto) {
    const { skip, take, page, limit } = this.paginate(query);
    return Promise.all([
      this.prisma.newsletterSubscription.findMany({ where: { deletedAt: null }, skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.newsletterSubscription.count({ where: { deletedAt: null } }),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  // Analytics
  getGrowthAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Promise.all([
      this.prisma.analyticsEvent.groupBy({ by: ["eventName"], _count: true, where: { createdAt: { gte: since } } }),
      this.prisma.couponRedemption.groupBy({ by: ["couponId"], _count: true, _sum: { discountAmount: true }, where: { createdAt: { gte: since } } }),
      this.prisma.affiliateConversion.aggregate({ _count: true, _sum: { commissionAmount: true }, where: { createdAt: { gte: since } } }),
      this.prisma.referral.count({ where: { createdAt: { gte: since } } }),
      this.prisma.newsletterSubscription.count({ where: { createdAt: { gte: since }, status: "subscribed" } }),
      this.prisma.blog.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      this.prisma.cmsPage.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    ]);
  }

  logAnalyticsEvent(eventName: string, properties?: Prisma.InputJsonValue, userId?: string) {
    return this.prisma.analyticsEvent.create({ data: { eventName, properties, userId } });
  }

  getSitemapEntries() {
    return Promise.all([
      this.prisma.cmsPage.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true, updatedAt: true } }),
      this.prisma.blog.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true, updatedAt: true, publishedAt: true } }),
      this.prisma.landingPage.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { slug: true, updatedAt: true } }),
      this.prisma.product.findMany({
        where: { status: "ACTIVE", visibility: "PUBLIC", deletedAt: null },
        select: { id: true, slug: true, updatedAt: true },
        take: 500,
      }),
    ]);
  }
}
