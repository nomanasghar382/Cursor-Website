export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  body?: string;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sections?: Array<Record<string, unknown>>;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string;
  status: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  category?: { id: string; name: string; slug: string };
  authorName?: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sections?: Array<Record<string, unknown>>;
  cmsPage?: {
    id: string;
    title: string;
    body: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  } | null;
  heroSections?: Array<{
    id: string;
    title: string;
    subtitle?: string | null;
    mediaUrl?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
  }>;
  banners?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string | null;
    placement: string;
  }>;
};

export type GrowthPromotion = {
  banners: Array<{
    id: string;
    title: string;
    imageUrl: string;
    placement: string;
    targetUrl?: string | null;
  }>;
  heroSections: Array<{
    id: string;
    title: string;
    subtitle?: string | null;
    mediaUrl?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
  }>;
  campaigns: Array<{ id: string; name: string; type: string }>;
};

export type GrowthSeo = {
  title: string;
  description: string;
  canonical: string;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  schema?: unknown;
  breadcrumbs?: unknown;
};

export type CmsDashboard = {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalFaqs: number;
  landingPages: number;
};

export type MarketingDashboard = {
  activeCampaigns: number;
  totalCampaigns: number;
  campaignAnalytics: { totalViews: number; byCampaign: Record<string, number> };
  couponPerformance: Array<{ code: string; usedCount: number; isActive: boolean }>;
  engagement: Record<string, unknown>;
  trafficSources: Record<string, number>;
};

export type SeoDashboard = {
  publishedPages: number;
  publishedBlogs: number;
  indexedProducts: number;
  totalSitemapEntries: number;
  coverageScore: number;
};

export type SitemapEntries = {
  pages: Array<{ slug: string; path: string; updatedAt: string }>;
  blogs: Array<{ slug: string; path: string; updatedAt: string }>;
  landingPages: Array<{ slug: string; path: string; updatedAt: string }>;
  products: Array<{ slug: string; path: string; updatedAt: string }>;
};
