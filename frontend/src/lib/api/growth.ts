import { apiRequest } from "@/lib/api/client";
import type {
  BlogPost,
  CmsDashboard,
  CmsPage,
  GrowthPromotion,
  GrowthSeo,
  LandingPage,
  MarketingDashboard,
  SeoDashboard,
  SitemapEntries,
} from "@/types/growth";

type Query = { page?: number; limit?: number; search?: string; category?: string };

function queryString(query?: Query) {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  const value = params.toString();
  return value ? `?${value}` : "";
}

export const growthApi = {
  pages(query?: Query) {
    return apiRequest<{ pages: CmsPage[]; total: number }>(`growth/pages${queryString(query)}`);
  },
  page(slug: string) {
    return apiRequest<{ page: CmsPage }>(`growth/pages/${slug}`);
  },
  blogs(query?: Query) {
    return apiRequest<{ blogs: BlogPost[]; total: number }>(`growth/blogs${queryString(query)}`);
  },
  blog(slug: string) {
    return apiRequest<{ blog: BlogPost }>(`growth/blogs/${slug}`);
  },
  blogCategories() {
    return apiRequest<{ categories: Array<{ id: string; name: string; slug: string }> }>("growth/blog-categories");
  },
  faqs() {
    return apiRequest<{ faqs: Array<{ id: string; question: string; answer: string; category?: string }> }>("growth/faqs");
  },
  landingPages(query?: Query) {
    return apiRequest<{ landingPages: LandingPage[]; total: number }>(`growth/landing${queryString(query)}`);
  },
  landingPage(slug: string) {
    return apiRequest<{ landingPage: LandingPage }>(`growth/landing/${slug}`);
  },
  promotions() {
    return apiRequest<GrowthPromotion>("growth/promotions");
  },
  subscribeNewsletter(email: string, source?: string) {
    return apiRequest<{ subscription: { id: string; email: string; status: string } }>("growth/newsletter/subscribe", {
      method: "POST",
      body: { email, source },
    });
  },
  trackEvent(eventType: string, metadata?: Record<string, unknown>) {
    return apiRequest("growth/analytics/track", { method: "POST", body: { eventType, metadata } });
  },
  pageSeo(slug: string) {
    return apiRequest<GrowthSeo>(`growth/seo/pages/${slug}`);
  },
  blogSeo(slug: string) {
    return apiRequest<GrowthSeo>(`growth/seo/blogs/${slug}`);
  },
  sitemap() {
    return apiRequest<SitemapEntries>("growth/seo/sitemap");
  },
};

export const growthAdminApi = {
  cmsDashboard(token: string) {
    return apiRequest<CmsDashboard>("admin/growth/dashboard/cms", { method: "GET", token });
  },
  marketingDashboard(token: string) {
    return apiRequest<MarketingDashboard>("admin/growth/dashboard/marketing", { method: "GET", token });
  },
  seoDashboard(token: string) {
    return apiRequest<SeoDashboard>("admin/growth/dashboard/seo", { method: "GET", token });
  },
  pages(token: string, query?: Query) {
    return apiRequest<{ pages: CmsPage[]; total: number }>(`admin/growth/cms/pages${queryString(query)}`, {
      method: "GET",
      token,
    });
  },
  blogs(token: string, query?: Query) {
    return apiRequest<{ blogs: BlogPost[]; total: number }>(`admin/growth/blogs${queryString(query)}`, {
      method: "GET",
      token,
    });
  },
  faqs(token: string) {
    return apiRequest<{ faqs: unknown[] }>("admin/growth/faqs", { method: "GET", token });
  },
  coupons(token: string) {
    return apiRequest<{ coupons: unknown[]; total: number }>("admin/growth/coupons", { method: "GET", token });
  },
  giftCards(token: string) {
    return apiRequest<{ giftCards: unknown[]; total: number }>("admin/growth/gift-cards", { method: "GET", token });
  },
  campaigns(token: string) {
    return apiRequest<{ campaigns: unknown[] }>("admin/growth/campaigns", { method: "GET", token });
  },
  engagement(token: string) {
    return apiRequest<Record<string, unknown>>("admin/growth/analytics/engagement", { method: "GET", token });
  },
};
