import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import {
  AffiliateTrackDto,
  GrowthPaginationDto,
  NewsletterSubscribeDto,
  ReferralJoinDto,
  TrackEventDto,
} from "../dto/growth.dto";
import { CmsService } from "../services/cms.service";
import { GrowthAnalyticsService } from "../services/growth-analytics.service";
import { MarketingService } from "../services/marketing.service";
import { SeoService } from "../services/seo.service";

@ApiTags("Growth")
@Controller({ path: "growth", version: ["1", VERSION_NEUTRAL] })
export class GrowthPublicController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly marketingService: MarketingService,
    private readonly seoService: SeoService,
    private readonly analyticsService: GrowthAnalyticsService,
  ) {}

  @Public()
  @Get("pages")
  listPages(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listPages(query, true);
  }

  @Public()
  @Get("pages/:slug")
  getPage(@Param("slug") slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  @Public()
  @Get("blogs")
  listBlogs(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listBlogs(query, true);
  }

  @Public()
  @Get("blogs/:slug")
  getBlog(@Param("slug") slug: string) {
    return this.cmsService.getBlogBySlug(slug);
  }

  @Public()
  @Get("blog-categories")
  listBlogCategories() {
    return this.cmsService.listCategories();
  }

  @Public()
  @Get("faqs")
  listFaqs() {
    return this.cmsService.listFaqs(true);
  }

  @Public()
  @Get("landing/:slug")
  getLandingPage(@Param("slug") slug: string) {
    return this.cmsService.getLandingPageBySlug(slug);
  }

  @Public()
  @Get("landing")
  listLandingPages(@Query() query: GrowthPaginationDto) {
    return this.cmsService.listLandingPages(query, true);
  }

  @Public()
  @Get("promotions")
  getPromotions() {
    return this.marketingService.getActivePromotions();
  }

  @Public()
  @Post("newsletter/subscribe")
  subscribeNewsletter(
    @Body() dto: NewsletterSubscribeDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.marketingService.subscribeNewsletter(dto, user?.id).then(async (result) => {
      await this.analyticsService.trackEvent({ eventType: "newsletter_signup", source: dto.source });
      return result;
    });
  }

  @Public()
  @Post("referrals/join")
  joinReferral(@Body() dto: ReferralJoinDto) {
    return this.marketingService.joinReferral(dto);
  }

  @Public()
  @Post("affiliates/track")
  trackAffiliate(@Body() dto: AffiliateTrackDto) {
    return this.marketingService.trackAffiliate(dto);
  }

  @Public()
  @Post("analytics/track")
  trackEvent(@Body() dto: TrackEventDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.analyticsService.trackEvent(dto, user?.id);
  }

  @Public()
  @Get("seo/pages/:slug")
  getPageSeo(@Param("slug") slug: string) {
    return this.seoService.getPageSeo(slug);
  }

  @Public()
  @Get("seo/blogs/:slug")
  getBlogSeo(@Param("slug") slug: string) {
    return this.seoService.getBlogSeo(slug);
  }

  @Public()
  @Get("seo/products/:slug")
  getProductSeo(@Param("slug") slug: string) {
    return this.seoService.getProductSeo(slug);
  }

  @Public()
  @Get("seo/categories/:slug")
  getCategorySeo(@Param("slug") slug: string) {
    return this.seoService.getCategorySeo(slug);
  }

  @Public()
  @Get("seo/faq-schema")
  getFaqSchema() {
    return this.seoService.getFaqSchema();
  }

  @Public()
  @Get("seo/sitemap")
  getSitemap() {
    return this.seoService.getSitemapEntries();
  }

  @Public()
  @Get("seo/robots")
  getRobots() {
    return this.seoService.getRobotsConfig();
  }
}
