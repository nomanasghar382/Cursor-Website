"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPanel } from "@/components/admin/admin-stat-card";
import { useRequireVendor } from "@/hooks/use-require-vendor";
import { vendorApi } from "@/lib/api/vendor";
import type { VendorAiInsights, VendorPayouts } from "@/types/vendor";
import { formatCurrency } from "@/lib/utils";

export function VendorPayoutsClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/payouts");
  const [payouts, setPayouts] = useState<VendorPayouts | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.payouts(token).then(setPayouts);
  }, [ready, token]);

  const requestPayout = async () => {
    if (!token) return;
    await vendorApi.requestPayout(token);
    toast.success("Payout request submitted");
  };

  if (!payouts) return <p className="text-muted-foreground">Loading payouts...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl font-semibold">Payouts</h1><p className="text-muted-foreground">Earnings, commissions, settlements, and transaction history.</p></div>
        <Button variant="gradient" onClick={() => void requestPayout()}>Request payout</Button>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <AdminPanel title="Gross revenue"><p className="font-display text-3xl font-semibold">{formatCurrency(payouts.earnings.grossRevenue)}</p></AdminPanel>
        <AdminPanel title="Commission"><p className="font-display text-3xl font-semibold">{formatCurrency(payouts.earnings.commission)}</p></AdminPanel>
        <AdminPanel title="Net earnings"><p className="font-display text-3xl font-semibold">{formatCurrency(payouts.earnings.netEarnings)}</p></AdminPanel>
        <AdminPanel title="Pending"><p className="font-display text-3xl font-semibold">{formatCurrency(payouts.earnings.pendingSettlement)}</p></AdminPanel>
      </section>
      <AdminPanel title="Payout architecture">
        <div className="flex flex-wrap gap-2">{payouts.architecture.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div>
      </AdminPanel>
      <AdminPanel title="Commission reports">
        <div className="space-y-3">
          {payouts.commissionReports.map((row) => (
            <div key={row.orderNumber} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm">
              <span>{row.orderNumber}</span>
              <span>{formatCurrency(row.net)} net</span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

export function VendorAnalyticsClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/analytics");
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof vendorApi.analytics>> | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.analytics(token).then(setAnalytics);
  }, [ready, token]);

  const exportReport = async (format: "csv" | "json") => {
    if (!token) return;
    const result = await vendorApi.exportReport(token, "sales", format);
    const content = result.content ?? JSON.stringify(result.rows, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `vendor-sales.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  if (!analytics) return <p className="text-muted-foreground">Loading analytics...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl font-semibold">Analytics</h1><p className="text-muted-foreground">Revenue, conversion, and growth intelligence.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void exportReport("csv")}>Export CSV</Button>
          <Button variant="outline" onClick={() => void exportReport("json")}>Export JSON</Button>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Revenue"><p className="font-display text-3xl font-semibold">{formatCurrency(analytics.revenue)}</p></AdminPanel>
        <AdminPanel title="Profit"><p className="font-display text-3xl font-semibold">{formatCurrency(analytics.profit)}</p></AdminPanel>
        <AdminPanel title="Conversion"><p className="font-display text-3xl font-semibold">{analytics.conversionRate}%</p></AdminPanel>
      </section>
    </div>
  );
}

export function VendorAiClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/ai");
  const [insights, setInsights] = useState<VendorAiInsights | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.aiInsights(token).then(setInsights);
  }, [ready, token]);

  if (!insights) return <p className="text-muted-foreground">Loading AI studio...</p>;

  return (
    <div className="space-y-8">
      <div><h1 className="font-display text-4xl font-semibold">AI studio</h1><p className="text-muted-foreground">Pricing, inventory, marketing, and customer intelligence.</p></div>
      <AdminPanel title="AI pricing suggestions">
        <div className="space-y-3">
          {insights.pricingSuggestions.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.reason}</p></div>
              <span>{formatCurrency(item.suggestedPrice)}</span>
            </div>
          ))}
        </div>
      </AdminPanel>
      <AdminPanel title="Marketing suggestions">
        <div className="space-y-2 text-sm text-muted-foreground">
          {insights.marketingSuggestions.map((s) => <p key={s} className="rounded-xl border border-border/60 px-4 py-3">{s}</p>)}
        </div>
      </AdminPanel>
    </div>
  );
}
