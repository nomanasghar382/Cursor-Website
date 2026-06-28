"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminPanel } from "@/components/admin/admin-stat-card";
import { AdminBarChart } from "@/components/admin/admin-bar-chart";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminDashboard } from "@/types/admin";

export function AdminAnalyticsClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/analytics");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.dashboard(token).then(setDashboard);
  }, [ready, token]);

  const exportReport = async (reportType: string, format: "csv" | "json" | "pdf") => {
    if (!token) return;
    const result = await adminApi.exportReport(token, reportType, format);
    if (result.content) {
      const blob = new Blob([result.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${reportType}.${format === "pdf" ? "txt" : format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } else if (result.rows) {
      const blob = new Blob([JSON.stringify(result.rows, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${reportType}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${reportType} report exported`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Analytics & reports</h1>
        <p className="text-muted-foreground">Revenue, sales, customer, inventory, vendor, and marketing intelligence.</p>
      </div>
      {dashboard ? (
        <AdminPanel title="Revenue trend" description="30-day revenue performance.">
          <AdminBarChart data={dashboard.salesSeries} valueKey="revenue" labelKey="day" />
        </AdminPanel>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {(["revenue", "sales", "customers", "inventory", "vendors", "marketing"] as const).map((reportType) => (
          <div key={reportType} className="rounded-[1.5rem] border border-border/60 p-5">
            <p className="font-medium capitalize">{reportType} report</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void exportReport(reportType, "csv")}>
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => void exportReport(reportType, "json")}>
                JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => void exportReport(reportType, "pdf")}>
                PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
