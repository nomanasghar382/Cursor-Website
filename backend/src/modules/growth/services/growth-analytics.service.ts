import { Injectable } from "@nestjs/common";
import { GrowthRepository } from "../repositories/growth.repository";
import { GrowthPaginationDto, TrackEventDto } from "../dto/growth.dto";

@Injectable()
export class GrowthAnalyticsService {
  constructor(private readonly growthRepository: GrowthRepository) {}

  trackEvent(dto: TrackEventDto, userId?: string) {
    return this.growthRepository
      .logAnalyticsEvent(dto.eventType, {
        source: dto.source,
        campaignId: dto.campaignId,
        ...(dto.metadata ?? {}),
      }, userId)
      .then(() => ({ tracked: true }));
  }

  async getCampaignAnalytics(campaignId?: string) {
    const events = await this.growthRepository.getAnalyticsEvents({ limit: 500 });
    const campaignEvents = events.filter((e) => {
      const props = (e.properties ?? {}) as Record<string, unknown>;
      if (campaignId) return props.campaignId === campaignId;
      return e.eventName.startsWith("campaign.");
    });
    const byCampaign = new Map<string, number>();
    for (const e of campaignEvents) {
      const props = (e.properties ?? {}) as Record<string, unknown>;
      const id = String(props.campaignId ?? "unknown");
      byCampaign.set(id, (byCampaign.get(id) ?? 0) + 1);
    }
    return {
      totalViews: campaignEvents.length,
      byCampaign: Object.fromEntries(byCampaign),
    };
  }

  async getTrafficSources(days = 30) {
    const events = await this.growthRepository.getAnalyticsEvents({ limit: 1000 });
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const sources = new Map<string, number>();
    for (const e of events.filter((ev) => ev.createdAt.getTime() >= cutoff)) {
      const props = (e.properties ?? {}) as Record<string, unknown>;
      const src = String(props.source ?? "direct");
      sources.set(src, (sources.get(src) ?? 0) + 1);
    }
    return Object.fromEntries(sources);
  }

  async getConversionTracking() {
    const events = await this.growthRepository.getAnalyticsEvents({ limit: 1000 });
    const views = events.filter((e) => e.eventName === "page_view").length;
    const conversions = events.filter((e) => e.eventName === "conversion").length;
    const signups = events.filter((e) => e.eventName === "newsletter_signup").length;
    return {
      pageViews: views,
      conversions,
      newsletterSignups: signups,
      conversionRate: views > 0 ? Number(((conversions / views) * 100).toFixed(2)) : 0,
    };
  }

  async getCouponPerformance() {
    const result = await this.growthRepository.listCoupons({ page: 1, limit: 100 });
    return result.items.map((c) => ({
      code: c.code,
      type: c.discountType,
      usedCount: c._count.redemptions,
      usageLimit: c.usageLimit,
      isActive: c.status === "ACTIVE",
      utilizationRate:
        c.usageLimit && c.usageLimit > 0
          ? Number(((c._count.redemptions / c.usageLimit) * 100).toFixed(1))
          : null,
    }));
  }

  async getAffiliateTracking() {
    const affiliates = await this.growthRepository.listAffiliates();
    return affiliates.map((a) => ({
      code: a.code,
      clicks: a._count.clicks,
      conversions: a._count.conversions,
      commissionRate: Number(a.commissionRate),
    }));
  }

  async getReferralTracking() {
    const referrals = await this.growthRepository.listReferrals();
    const completed = referrals.filter((r) => r.status === "completed").length;
    return {
      total: referrals.length,
      completed,
      pending: referrals.length - completed,
      completionRate:
        referrals.length > 0 ? Number(((completed / referrals.length) * 100).toFixed(1)) : 0,
    };
  }

  async getEngagementMetrics() {
    const [newsletter, referrals, affiliates, conversions] = await Promise.all([
      this.growthRepository.listNewsletterSubscriptions({ page: 1, limit: 1000 }),
      this.getReferralTracking(),
      this.getAffiliateTracking(),
      this.getConversionTracking(),
    ]);
    return {
      newsletterSubscribers: newsletter.total,
      activeSubscribers: newsletter.items.filter((s) => s.status === "subscribed").length,
      referrals,
      affiliateClicks: affiliates.reduce((s, a) => s + a.clicks, 0),
      ...conversions,
    };
  }

  async getMarketingDashboard() {
    const [campaignAnalytics, couponPerformance, engagement, trafficSources, campaigns] = await Promise.all([
      this.getCampaignAnalytics(),
      this.getCouponPerformance(),
      this.getEngagementMetrics(),
      this.getTrafficSources(),
      this.growthRepository.listCampaigns(),
    ]);
    return {
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
      totalCampaigns: campaigns.length,
      campaignAnalytics,
      couponPerformance,
      engagement,
      trafficSources,
    };
  }

  async getCmsDashboard() {
    const query: GrowthPaginationDto = { page: 1, limit: 1000 };
    const [pages, blogs, faqs, landing] = await Promise.all([
      this.growthRepository.listCmsPages(query),
      this.growthRepository.listBlogs(query),
      this.growthRepository.listFaqs(),
      this.growthRepository.listLandingPages(query),
    ]);
    return {
      totalPages: pages.total,
      publishedPages: pages.items.filter((p) => p.status === "PUBLISHED").length,
      draftPages: pages.items.filter((p) => p.status === "DRAFT").length,
      totalBlogs: blogs.total,
      publishedBlogs: blogs.items.filter((b) => b.status === "PUBLISHED").length,
      totalFaqs: faqs.length,
      landingPages: landing.total,
    };
  }

  async getGrowthSummary(days = 30) {
    const [eventGroups, redemptions, affiliateAgg, referralCount, newsletterCount, blogCount, pageCount] =
      await this.growthRepository.getGrowthAnalytics(days);
    return {
      eventBreakdown: eventGroups,
      couponRedemptions: redemptions,
      affiliateConversions: affiliateAgg,
      newReferrals: referralCount,
      newsletterSignups: newsletterCount,
      publishedBlogs: blogCount,
      publishedPages: pageCount,
    };
  }
}
