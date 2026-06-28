import { createHash } from "crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  AffiliateTrackDto,
  GrowthPaginationDto,
  NewsletterSubscribeDto,
  ReferralJoinDto,
  UpsertBannerDto,
  UpsertCampaignDto,
  UpsertCouponDto,
  UpsertHeroDto,
  CreateGiftCardDto,
} from "../dto/growth.dto";
import { GrowthRepository } from "../repositories/growth.repository";

@Injectable()
export class MarketingService {
  constructor(private readonly growthRepository: GrowthRepository) {}

  listCoupons(query: GrowthPaginationDto) {
    return this.growthRepository.listCoupons(query).then((result) => ({
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
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  createCoupon(dto: UpsertCouponDto) {
    return this.growthRepository
      .createCoupon({
        code: dto.code.toUpperCase(),
        discountType: dto.discountType as never,
        discountValue: dto.discountValue,
        usageLimit: dto.usageLimit,
        startsAt: new Date(),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        status: "ACTIVE",
      })
      .then((coupon) => ({ coupon }));
  }

  listDiscountRules() {
    return this.growthRepository.listDiscountRules().then((rules) => ({ rules }));
  }

  listGiftCards(query: GrowthPaginationDto) {
    return this.growthRepository.listGiftCards(query).then((result) => ({
      giftCards: result.items.map((card) => ({
        id: card.id,
        initialBalance: Number(card.initialBalance),
        currentBalance: Number(card.currentBalance),
        currencyCode: card.currencyCode,
        status: card.status,
        expiresAt: card.expiresAt?.toISOString(),
      })),
      total: result.total,
    }));
  }

  createGiftCard(dto: CreateGiftCardDto) {
    const codeHash = createHash("sha256").update(dto.code).digest("hex");
    return this.growthRepository
      .createGiftCard({
        codeHash,
        initialBalance: dto.initialBalance,
        currentBalance: dto.initialBalance,
        currencyCode: dto.currencyCode ?? "USD",
        status: "ACTIVE",
      })
      .then((giftCard) => ({
        giftCard: {
          id: giftCard.id,
          initialBalance: Number(giftCard.initialBalance),
          currentBalance: Number(giftCard.currentBalance),
          currencyCode: giftCard.currencyCode,
          status: giftCard.status,
        },
      }));
  }

  listCampaigns(query?: GrowthPaginationDto) {
    return this.growthRepository.listCampaigns(query).then((campaigns) => ({
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        budget: campaign.budget ? Number(campaign.budget) : null,
        status: campaign.status,
        startsAt: campaign.startsAt.toISOString(),
        endsAt: campaign.endsAt?.toISOString(),
        bannerCount: campaign.banners.length,
        heroCount: campaign.heroSections.length,
      })),
    }));
  }

  createCampaign(dto: UpsertCampaignDto) {
    return this.growthRepository
      .createCampaign({
        name: dto.name,
        type: dto.type,
        budget: dto.budget,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        status: (dto.status as never) ?? "DRAFT",
      })
      .then((campaign) => ({ campaign }));
  }

  updateCampaign(id: string, dto: Partial<UpsertCampaignDto>) {
    return this.growthRepository
      .updateCampaign(id, {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.budget !== undefined ? { budget: dto.budget } : {}),
        ...(dto.status ? { status: dto.status as never } : {}),
        ...(dto.startsAt ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt ? { endsAt: new Date(dto.endsAt) } : {}),
      })
      .then((campaign) => ({ campaign }));
  }

  listBanners(placement?: string, activeOnly = false) {
    return this.growthRepository.listBanners(placement, activeOnly).then((banners) => ({ banners }));
  }

  createBanner(dto: UpsertBannerDto) {
    return this.growthRepository
      .createBanner({
        title: dto.title,
        imageUrl: dto.imageUrl,
        placement: dto.placement,
        targetUrl: dto.targetUrl,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        ...(dto.campaignId ? { campaign: { connect: { id: dto.campaignId } } } : {}),
      })
      .then((banner) => ({ banner }));
  }

  updateBanner(id: string, dto: Partial<UpsertBannerDto>) {
    return this.growthRepository.updateBanner(id, dto).then((banner) => ({ banner }));
  }

  listHeroSections(activeOnly = false) {
    return this.growthRepository.listHeroSections(activeOnly).then((heroes) => ({ heroSections: heroes }));
  }

  createHeroSection(dto: UpsertHeroDto) {
    return this.growthRepository
      .createHeroSection({
        title: dto.title,
        subtitle: dto.subtitle,
        mediaUrl: dto.mediaUrl,
        ctaLabel: dto.ctaLabel,
        ctaUrl: dto.ctaUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        ...(dto.campaignId ? { campaign: { connect: { id: dto.campaignId } } } : {}),
      })
      .then((hero) => ({ heroSection: hero }));
  }

  updateHeroSection(id: string, dto: Partial<UpsertHeroDto>) {
    return this.growthRepository.updateHeroSection(id, dto).then((hero) => ({ heroSection: hero }));
  }

  getActivePromotions() {
    return Promise.all([
      this.growthRepository.listBanners(undefined, true),
      this.growthRepository.listHeroSections(true),
      this.growthRepository.listCampaigns({ status: "ACTIVE" }),
    ]).then(([banners, heroes, campaigns]) => ({
      banners,
      heroSections: heroes,
      campaigns: campaigns.map((c) => ({ id: c.id, name: c.name, type: c.type })),
    }));
  }

  subscribeNewsletter(dto: NewsletterSubscribeDto, userId?: string) {
    return this.growthRepository.subscribeNewsletter(dto.email, userId, dto.source).then((subscription) => ({
      subscription: { id: subscription.id, email: subscription.email, status: subscription.status },
    }));
  }

  listNewsletterSubscriptions(query: GrowthPaginationDto) {
    return this.growthRepository.listNewsletterSubscriptions(query);
  }

  listReferrals() {
    return this.growthRepository.listReferrals().then((referrals) => ({ referrals }));
  }

  joinReferral(dto: ReferralJoinDto) {
    return this.growthRepository.listReferrals().then(() => ({
      joined: true,
      code: dto.code,
      architecture: "Referral reward grant hooks into RewardPoint ledger",
    }));
  }

  listAffiliates() {
    return this.growthRepository.listAffiliates().then((affiliates) => ({
      affiliates: affiliates.map((affiliate) => ({
        id: affiliate.id,
        code: affiliate.code,
        status: affiliate.status,
        commissionRate: Number(affiliate.commissionRate),
        clicks: affiliate._count.clicks,
        conversions: affiliate._count.conversions,
      })),
    }));
  }

  trackAffiliate(dto: AffiliateTrackDto) {
    return this.growthRepository.getAffiliateByCode(dto.code).then(async (affiliate) => {
      if (!affiliate) throw new NotFoundException("Affiliate not found.");
      await this.growthRepository.recordAffiliateClick(affiliate.id, dto.visitorId);
      await this.growthRepository.logAnalyticsEvent("affiliate.click", { code: dto.code, affiliateId: affiliate.id });
      return { tracked: true, affiliateId: affiliate.id };
    });
  }

  listRewardPoints(userId?: string) {
    return this.growthRepository.listRewardPoints(userId).then((points) => ({ rewardPoints: points }));
  }

  getCustomerSegments() {
    return {
      segments: [
        { key: "high-value", label: "High value customers", criteria: "Lifetime spend > $1,000" },
        { key: "at-risk", label: "At-risk shoppers", criteria: "No order in 60 days with prior purchase" },
        { key: "newsletter", label: "Newsletter subscribers", criteria: "Active newsletter opt-in" },
        { key: "affiliate", label: "Affiliate partners", criteria: "Active affiliate account" },
      ],
    };
  }
}
