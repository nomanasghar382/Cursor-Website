"use client";

import { useEffect, useState } from "react";
import { FileText, Globe, Megaphone, Newspaper, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminPanel, AdminStatCard } from "@/components/admin/admin-stat-card";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { growthAdminApi } from "@/lib/api/growth";

export function AdminContentClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/content");
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof growthAdminApi.cmsDashboard>> | null>(null);
  const [pages, setPages] = useState<unknown[]>([]);
  const [blogs, setBlogs] = useState<unknown[]>([]);
  const [faqs, setFaqs] = useState<unknown[]>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([
      growthAdminApi.cmsDashboard(token),
      growthAdminApi.pages(token),
      growthAdminApi.blogs(token),
      growthAdminApi.faqs(token),
    ]).then(([dash, pageResult, blogResult, faqResult]) => {
      setDashboard(dash);
      setPages(pageResult.pages);
      setBlogs(blogResult.blogs);
      setFaqs(faqResult.faqs);
    });
  }, [ready, token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Content management</h1>
        <p className="text-muted-foreground">CMS pages, blogs, FAQs, landing pages, and content approval workflow.</p>
      </div>

      {dashboard ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={FileText} label="Published pages" value={String(dashboard.publishedPages)} hint={`${dashboard.draftPages} drafts`} />
          <AdminStatCard icon={Newspaper} label="Published blogs" value={String(dashboard.publishedBlogs)} hint={`${dashboard.totalBlogs} total`} />
          <AdminStatCard icon={Search} label="FAQs" value={String(dashboard.totalFaqs)} />
          <AdminStatCard icon={Globe} label="Landing pages" value={String(dashboard.landingPages)} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="CMS pages" description="Dynamic pages with draft and published states.">
          <div className="space-y-3">
            {pages.map((page) => {
              const entry = page as { id: string; title: string; slug: string; status: string };
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">/pages/{entry.slug}</p>
                  </div>
                  <Badge variant="secondary">{entry.status}</Badge>
                </div>
              );
            })}
          </div>
        </AdminPanel>
        <AdminPanel title="Blogs" description="Articles with categories, tags, and SEO metadata.">
          <div className="space-y-3">
            {blogs.map((blog) => {
              const entry = blog as { id: string; title: string; slug: string; status: string };
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">/blog/{entry.slug}</p>
                  </div>
                  <Badge variant="secondary">{entry.status}</Badge>
                </div>
              );
            })}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="FAQs" description="Structured FAQ content with schema-ready answers.">
        <div className="space-y-3">
          {faqs.map((faq) => {
            const entry = faq as { id: string; question: string; isActive?: boolean };
            return (
              <div key={entry.id} className="rounded-xl border border-border/60 px-4 py-3">
                <p className="font-medium">{entry.question}</p>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}

export function AdminMarketingClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/marketing");
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof growthAdminApi.marketingDashboard>> | null>(null);
  const [coupons, setCoupons] = useState<unknown[]>([]);
  const [giftCards, setGiftCards] = useState<unknown[]>([]);
  const [campaigns, setCampaigns] = useState<unknown[]>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([
      growthAdminApi.marketingDashboard(token),
      growthAdminApi.coupons(token),
      growthAdminApi.giftCards(token),
      growthAdminApi.campaigns(token),
    ]).then(([dash, couponResult, giftCardResult, campaignResult]) => {
      setDashboard(dash);
      setCoupons(couponResult.coupons);
      setGiftCards(giftCardResult.giftCards);
      setCampaigns(campaignResult.campaigns);
    });
  }, [ready, token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Marketing</h1>
        <p className="text-muted-foreground">Campaigns, coupons, gift cards, affiliates, and growth analytics.</p>
      </div>

      {dashboard ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={Megaphone} label="Active campaigns" value={String(dashboard.activeCampaigns)} hint={`${dashboard.totalCampaigns} total`} />
          <AdminStatCard icon={Search} label="Campaign views" value={String(dashboard.campaignAnalytics.totalViews)} />
          <AdminStatCard
            icon={Newspaper}
            label="Newsletter signups"
            value={String((dashboard.engagement.newsletterSignups as number) ?? 0)}
          />
          <AdminStatCard icon={Globe} label="Conversion rate" value={`${dashboard.engagement.conversionRate ?? 0}%`} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Coupons" description="Discount codes and redemption performance.">
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const entry = coupon as { id: string; code: string; status: string; redemptions: number };
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                  <span className="font-medium">{entry.code}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{entry.status}</Badge>
                    <span className="text-sm text-muted-foreground">{entry.redemptions} uses</span>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminPanel>
        <AdminPanel title="Gift cards" description="Stored-value balances and transaction history.">
          <div className="space-y-3">
            {giftCards.map((card) => {
              const entry = card as { id: string; currentBalance: number; currencyCode: string; status: string };
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                  <span className="font-mono text-sm">{entry.id.slice(0, 8)}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{entry.status}</Badge>
                    <span className="font-medium">
                      {entry.currentBalance} {entry.currencyCode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="Campaigns" description="Flash sales, seasonal campaigns, and promotional banners.">
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const entry = campaign as { id: string; name: string; type: string; status: string };
            return (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.type}</p>
                </div>
                <Badge variant="secondary">{entry.status}</Badge>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}

export function AdminSeoClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/seo");
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof growthAdminApi.seoDashboard>> | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void growthAdminApi.seoDashboard(token).then(setDashboard);
  }, [ready, token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">SEO dashboard</h1>
        <p className="text-muted-foreground">Metadata coverage, sitemap health, and structured data readiness.</p>
      </div>

      {dashboard ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={Globe} label="Sitemap entries" value={String(dashboard.totalSitemapEntries)} />
          <AdminStatCard icon={FileText} label="Published pages" value={String(dashboard.publishedPages)} />
          <AdminStatCard icon={Newspaper} label="Published blogs" value={String(dashboard.publishedBlogs)} />
          <AdminStatCard icon={Search} label="Coverage score" value={`${dashboard.coverageScore}%`} trend="SEO health" />
        </div>
      ) : null}

      <AdminPanel title="SEO engine" description="Dynamic metadata, Open Graph, Twitter cards, and schema markup.">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Product, category, page, and blog SEO endpoints</li>
          <li>FAQ, product, review, and breadcrumb schema builders</li>
          <li>Canonical URLs and robots configuration</li>
          <li>Dynamic sitemap generation from CMS, blog, and catalog content</li>
        </ul>
      </AdminPanel>
    </div>
  );
}
