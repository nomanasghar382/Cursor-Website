"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, DollarSign, Package, ShoppingBag, Sparkles, TrendingUp, Users } from "lucide-react";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import { AdminPanel, AdminStatCard } from "@/components/admin/admin-stat-card";
import { ErrorState } from "@/components/common/state-panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminAiInsights, AdminDashboard } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";

export function AdminDashboardClient() {
  const { token, ready } = useRequireAdmin();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [ai, setAi] = useState<AdminAiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    void Promise.all([adminApi.dashboard(token), adminApi.aiInsights(token)])
      .then(([dashboardResult, aiResult]) => {
        setDashboard(dashboardResult);
        setAi(aiResult);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!ready || !token) return;
    load();
  }, [ready, token]);

  if (error && !loading) {
    return <ErrorState title="Admin dashboard unavailable" description="Could not load executive metrics." onRetry={load} />;
  }

  if (loading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Executive overview</p>
          <h1 className="font-display text-4xl font-semibold">Admin command center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Real-time commerce intelligence across revenue, orders, customers, vendors, and inventory health.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/admin/analytics">Open analytics</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={DollarSign} label="Revenue" value={formatCurrency(dashboard.executive.revenue)} hint="Verified lifetime" />
        <AdminStatCard icon={ShoppingBag} label="Orders" value={String(dashboard.executive.orders)} hint="Fulfilled and active" />
        <AdminStatCard icon={Users} label="Customers" value={String(dashboard.executive.customers)} hint={`${dashboard.executive.conversionRate}% conversion`} />
        <AdminStatCard icon={Package} label="Products" value={String(dashboard.executive.products)} hint={`${dashboard.executive.lowStockAlerts} low stock alerts`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <AdminPanel title="Sales analytics" description="30-day revenue and order velocity.">
          <AdminBarChart data={dashboard.salesSeries} valueKey="revenue" labelKey="day" />
        </AdminPanel>
        <AdminPanel title="Traffic sources" description="Top analytics events in the last 30 days.">
          <div className="space-y-3">
            {dashboard.trafficSources.map((source) => (
              <div key={source.source} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm">
                <span>{source.source}</span>
                <Badge variant="secondary">{source.visits}</Badge>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Top products" description="Revenue leaders across the catalog.">
          <div className="space-y-3">
            {dashboard.topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.units} units sold</p>
                </div>
                <p className="font-semibold">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel title="Latest orders" description="Most recent commerce activity.">
          <div className="space-y-3">
            {dashboard.latestOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-secondary/40">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{order.status}</Badge>
                  <p className="mt-1 font-semibold">{formatCurrency(order.grandTotal)}</p>
                </div>
              </Link>
            ))}
          </div>
        </AdminPanel>
      </div>

      {ai ? (
        <AdminPanel title="AI business insights" description="Forecasting, fraud posture, and growth recommendations.">
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                Sales forecast
              </div>
              <p className="font-display text-2xl font-semibold">{formatCurrency(ai.salesForecast.projectedRevenue)}</p>
              <p className="text-xs text-muted-foreground">{Math.round(ai.salesForecast.confidence * 100)}% confidence · {ai.salesForecast.horizonDays} days</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Fraud detection
              </div>
              <p className="font-display text-2xl font-semibold">{ai.fraudDetection.riskLevel}</p>
              <p className="text-xs text-muted-foreground">{ai.fraudDetection.signalsLast7Days} signals last 7 days</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Support load
              </div>
              <p className="font-display text-2xl font-semibold">{ai.supportAnalytics.openReturns}</p>
              <p className="text-xs text-muted-foreground">{ai.supportAnalytics.pendingReviews} reviews pending</p>
            </motion.div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {ai.marketingSuggestions.map((suggestion) => (
              <p key={suggestion} className="rounded-xl border border-border/60 px-4 py-3">
                {suggestion}
              </p>
            ))}
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}
