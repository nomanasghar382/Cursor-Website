"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Package, ShoppingBag, Sparkles, Star, Store } from "lucide-react";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import { AdminPanel, AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireVendor } from "@/hooks/use-require-vendor";
import { vendorApi } from "@/lib/api/vendor";
import type { VendorAiInsights, VendorDashboard } from "@/types/vendor";
import { formatCurrency } from "@/lib/utils";

export function VendorDashboardClient() {
  const { token, ready } = useRequireVendor();
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [ai, setAi] = useState<VendorAiInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([vendorApi.dashboard(token), vendorApi.aiInsights(token)])
      .then(([dashboardResult, aiResult]) => { setDashboard(dashboardResult); setAi(aiResult); })
      .finally(() => setLoading(false));
  }, [ready, token]);

  if (loading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-[1.5rem]" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Seller central</p>
          <h1 className="font-display text-4xl font-semibold">Vendor dashboard</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Revenue, fulfillment, inventory, and AI-powered growth intelligence for your marketplace store.</p>
        </div>
        <Badge variant="accent">Store health {dashboard.executive.healthScore}%</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={DollarSign} label="Revenue" value={formatCurrency(dashboard.executive.revenue)} hint="Store lifetime" />
        <AdminStatCard icon={ShoppingBag} label="Orders" value={String(dashboard.executive.orders)} hint="All statuses" />
        <AdminStatCard icon={Package} label="Products" value={String(dashboard.executive.products)} hint={`${dashboard.executive.lowStockAlerts} low stock`} />
        <AdminStatCard icon={Star} label="Rating" value={dashboard.executive.averageRating.toFixed(1)} hint={`${dashboard.executive.reviewCount} reviews`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <AdminPanel title="Revenue analytics" description="30-day sales performance.">
          <AdminBarChart data={dashboard.salesSeries} valueKey="revenue" labelKey="day" />
        </AdminPanel>
        <AdminPanel title="Quick actions">
          <div className="space-y-2">
            {dashboard.quickActions.map((action) => (
              <Button key={action.href} asChild variant="outline" className="w-full justify-between">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Pending orders" description="Orders awaiting fulfillment.">
          <div className="space-y-3">
            {dashboard.pendingOrders.map((order) => (
              <Link key={order.id} href={`/vendor/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 hover:bg-secondary/40">
                <div><p className="font-medium">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{order.customerName}</p></div>
                <Badge variant="secondary">{order.status}</Badge>
              </Link>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel title="Low stock alerts">
          <div className="space-y-3">
            {dashboard.lowStockAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div><p className="font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{item.sku} · {item.warehouse}</p></div>
                <Badge variant="accent">{item.available} left</Badge>
              </div>
            ))}
            {dashboard.lowStockAlerts.length === 0 ? <p className="text-sm text-muted-foreground">Inventory levels are healthy.</p> : null}
          </div>
        </AdminPanel>
      </div>

      {ai ? (
        <AdminPanel title="AI business insights">
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 p-4">
              <Sparkles className="mb-2 h-4 w-4 text-primary" />
              <p className="font-display text-2xl font-semibold">{formatCurrency(ai.salesForecast.projectedRevenue)}</p>
              <p className="text-xs text-muted-foreground">30-day sales forecast</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border/60 p-4">
              <AlertTriangle className="mb-2 h-4 w-4 text-primary" />
              <p className="font-medium">{ai.inventoryPrediction.recommendation}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/60 p-4">
              <Store className="mb-2 h-4 w-4 text-primary" />
              <p className="font-display text-2xl font-semibold">{ai.customerInsights.uniqueBuyers}</p>
              <p className="text-xs text-muted-foreground">Unique buyers</p>
            </motion.div>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}
