import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import {
  ContentApprovalDto,
  CreateGiftCardDto,
  GrowthPaginationDto,
  SendMarketingEmailDto,
  UpsertBannerDto,
  UpsertBlogDto,
  UpsertCampaignDto,
  UpsertCmsPageDto,
  UpsertCouponDto,
  UpsertFaqDto,
  UpsertHeroDto,
  UpsertLandingPageDto,
} from "../dto/growth.dto";
import { CmsService } from "../services/cms.service";
import { EmailEngagementService } from "../services/email-engagement.service";
import { GrowthAnalyticsService } from "../services/growth-analytics.service";
import { MarketingService } from "../services/marketing.service";
import { SeoService } from "../services/seo.service";

@ApiTags("Admin Growth")
@ApiBearerAuth()
@Controller({ path: "admin/growth", version: ["1", VERSION_NEUTRAL] })
export class GrowthAdminController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly marketingService: MarketingService,
    private readonly seoService: SeoService,
    private readonly analyticsService: GrowthAnalyticsService,
    private readonly emailService: EmailEngagementService,
  ) {}

  @Get("dashboard/cms")
  @Permissions("content:read")
  cmsDashboard() {
    return this.analyticsService.getCmsDashboard();
  }

  @Get("dashboard/marketing")
  @Permissions("settings:read")
  marketingDashboard() {
    return this.analyticsService.getMarketingDashboard();
  }

  @Get("dashboard/seo")
  @Permissions("content:read")
  seoDashboard() {
    return this.seoService.getSeoAnalytics();
  }

  @Get("dashboard/summary")
  @Permissions("settings:read")
  growthSummary(@Query("days") days?: string) {
    return this.analyticsService.getGrowthSummary(days ? Number(days) : 30);
  }

  @Get("cms/pages")
  @Permissions("content:read")
  listPages(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listPages(query);
  }

  @Get("cms/pages/:id")
  @Permissions("content:read")
  getPage(@Param("id") id: string) {
    return this.cmsService.getPageAdmin(id);
  }

  @Post("cms/pages")
  @Permissions("content:write")
  createPage(@Body() dto: UpsertCmsPageDto) {
    return this.cmsService.createPage(dto);
  }

  @Patch("cms/pages/:id")
  @Permissions("content:write")
  updatePage(@Param("id") id: string, @Body() dto: Partial<UpsertCmsPageDto>) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete("cms/pages/:id")
  @Permissions("content:write")
  deletePage(@Param("id") id: string) {
    return this.cmsService.deletePage(id);
  }

  @Post("cms/pages/:id/approval")
  @Permissions("content:write")
  approvePage(@Param("id") id: string, @Body() dto: ContentApprovalDto) {
    return this.cmsService.approveContent("page", id, dto.action);
  }

  @Get("blogs")
  @Permissions("content:read")
  listBlogs(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listBlogs(query);
  }

  @Post("blogs")
  @Permissions("content:write")
  createBlog(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertBlogDto) {
    return this.cmsService.createBlog(dto, user.id);
  }

  @Patch("blogs/:id")
  @Permissions("content:write")
  updateBlog(@Param("id") id: string, @Body() dto: Partial<UpsertBlogDto>) {
    return this.cmsService.updateBlog(id, dto);
  }

  @Delete("blogs/:id")
  @Permissions("content:write")
  deleteBlog(@Param("id") id: string) {
    return this.cmsService.deleteBlog(id);
  }

  @Post("blogs/:id/approval")
  @Permissions("content:write")
  approveBlog(@Param("id") id: string, @Body() dto: ContentApprovalDto) {
    return this.cmsService.approveContent("blog", id, dto.action);
  }

  @Get("blog-categories")
  @Permissions("content:read")
  listBlogCategories() {
    return this.cmsService.listCategories();
  }

  @Get("faqs")
  @Permissions("content:read")
  listFaqs() {
    return this.cmsService.listFaqs();
  }

  @Post("faqs")
  @Permissions("content:write")
  createFaq(@Body() dto: UpsertFaqDto) {
    return this.cmsService.createFaq(dto);
  }

  @Patch("faqs/:id")
  @Permissions("content:write")
  updateFaq(@Param("id") id: string, @Body() dto: Partial<UpsertFaqDto>) {
    return this.cmsService.updateFaq(id, dto);
  }

  @Delete("faqs/:id")
  @Permissions("content:write")
  deleteFaq(@Param("id") id: string) {
    return this.cmsService.deleteFaq(id);
  }

  @Get("landing-pages")
  @Permissions("content:read")
  listLandingPages(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listLandingPages(query);
  }

  @Post("landing-pages")
  @Permissions("content:write")
  createLandingPage(@Body() dto: UpsertLandingPageDto) {
    return this.cmsService.createLandingPage(dto);
  }

  @Patch("landing-pages/:id")
  @Permissions("content:write")
  updateLandingPage(@Param("id") id: string, @Body() dto: Partial<UpsertLandingPageDto>) {
    return this.cmsService.updateLandingPage(id, dto);
  }

  @Post("landing-pages/:id/approval")
  @Permissions("content:write")
  approveLanding(@Param("id") id: string, @Body() dto: ContentApprovalDto) {
    return this.cmsService.approveContent("landing", id, dto.action);
  }

  @Get("media")
  @Permissions("content:read")
  mediaLibrary() {
    return this.cmsService.getMediaLibrary();
  }

  @Get("coupons")
  @Permissions("settings:read")
  listCoupons(@Query() query: GrowthPaginationDto) {
    return this.marketingService.listCoupons(query);
  }

  @Post("coupons")
  @Permissions("settings:write")
  createCoupon(@Body() dto: UpsertCouponDto) {
    return this.marketingService.createCoupon(dto);
  }

  @Get("discount-rules")
  @Permissions("settings:read")
  listDiscountRules() {
    return this.marketingService.listDiscountRules();
  }

  @Get("gift-cards")
  @Permissions("settings:read")
  listGiftCards(@Query() query: GrowthPaginationDto) {
    return this.marketingService.listGiftCards(query);
  }

  @Post("gift-cards")
  @Permissions("settings:write")
  createGiftCard(@Body() dto: CreateGiftCardDto) {
    return this.marketingService.createGiftCard(dto);
  }

  @Get("campaigns")
  @Permissions("settings:read")
  listCampaigns(@Query() query: GrowthPaginationDto) {
    return this.marketingService.listCampaigns(query);
  }

  @Post("campaigns")
  @Permissions("settings:write")
  createCampaign(@Body() dto: UpsertCampaignDto) {
    return this.marketingService.createCampaign(dto);
  }

  @Patch("campaigns/:id")
  @Permissions("settings:write")
  updateCampaign(@Param("id") id: string, @Body() dto: Partial<UpsertCampaignDto>) {
    return this.marketingService.updateCampaign(id, dto);
  }

  @Get("banners")
  @Permissions("content:read")
  listBanners(@Query("placement") placement?: string) {
    return this.marketingService.listBanners(placement);
  }

  @Post("banners")
  @Permissions("content:write")
  createBanner(@Body() dto: UpsertBannerDto) {
    return this.marketingService.createBanner(dto);
  }

  @Patch("banners/:id")
  @Permissions("content:write")
  updateBanner(@Param("id") id: string, @Body() dto: Partial<UpsertBannerDto>) {
    return this.marketingService.updateBanner(id, dto);
  }

  @Get("heroes")
  @Permissions("content:read")
  listHeroes() {
    return this.marketingService.listHeroSections();
  }

  @Post("heroes")
  @Permissions("content:write")
  createHero(@Body() dto: UpsertHeroDto) {
    return this.marketingService.createHeroSection(dto);
  }

  @Patch("heroes/:id")
  @Permissions("content:write")
  updateHero(@Param("id") id: string, @Body() dto: Partial<UpsertHeroDto>) {
    return this.marketingService.updateHeroSection(id, dto);
  }

  @Get("newsletter")
  @Permissions("settings:read")
  listNewsletter(@Query() query: GrowthPaginationDto) {
    return this.marketingService.listNewsletterSubscriptions(query);
  }

  @Get("referrals")
  @Permissions("settings:read")
  listReferrals() {
    return this.marketingService.listReferrals();
  }

  @Get("affiliates")
  @Permissions("settings:read")
  listAffiliates() {
    return this.marketingService.listAffiliates();
  }

  @Get("reward-points")
  @Permissions("settings:read")
  listRewardPoints(@Query("userId") userId?: string) {
    return this.marketingService.listRewardPoints(userId);
  }

  @Get("segments")
  @Permissions("settings:read")
  customerSegments() {
    return this.marketingService.getCustomerSegments();
  }

  @Get("email/architecture")
  @Permissions("settings:read")
  emailArchitecture() {
    return this.emailService.getEmailArchitecture();
  }

  @Post("email/send")
  @Permissions("settings:write")
  sendMarketingEmail(@Body() dto: SendMarketingEmailDto) {
    return this.emailService.sendMarketingEmail(dto);
  }

  @Get("analytics/campaigns")
  @Permissions("settings:read")
  campaignAnalytics(@Query("campaignId") campaignId?: string) {
    return this.analyticsService.getCampaignAnalytics(campaignId);
  }

  @Get("analytics/traffic")
  @Permissions("settings:read")
  trafficSources(@Query("days") days?: string) {
    return this.analyticsService.getTrafficSources(days ? Number(days) : 30);
  }

  @Get("analytics/conversions")
  @Permissions("settings:read")
  conversions() {
    return this.analyticsService.getConversionTracking();
  }

  @Get("analytics/coupons")
  @Permissions("settings:read")
  couponPerformance() {
    return this.analyticsService.getCouponPerformance();
  }

  @Get("analytics/affiliates")
  @Permissions("settings:read")
  affiliateTracking() {
    return this.analyticsService.getAffiliateTracking();
  }

  @Get("analytics/referrals")
  @Permissions("settings:read")
  referralTracking() {
    return this.analyticsService.getReferralTracking();
  }

  @Get("analytics/engagement")
  @Permissions("settings:read")
  engagementMetrics() {
    return this.analyticsService.getEngagementMetrics();
  }
}
