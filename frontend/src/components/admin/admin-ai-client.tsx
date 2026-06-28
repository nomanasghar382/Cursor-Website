"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/admin-stat-card";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminAiInsights } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";

export function AdminAiClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/ai");
  const [insights, setInsights] = useState<AdminAiInsights | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.aiInsights(token).then(setInsights);
  }, [ready, token]);

  if (!insights) return <p className="text-muted-foreground">Loading AI insights...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">AI operations</h1>
        <p className="text-muted-foreground">Forecasting, fraud detection, product performance, and support analytics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Sales forecast">
          <p className="font-display text-3xl font-semibold">{formatCurrency(insights.salesForecast.projectedRevenue)}</p>
        </AdminPanel>
        <AdminPanel title="Inventory prediction">
          <p className="font-display text-3xl font-semibold">{insights.inventoryPrediction.availableUnits}</p>
          <p className="text-sm text-muted-foreground">Risk: {insights.inventoryPrediction.reorderRisk}</p>
        </AdminPanel>
        <AdminPanel title="Fraud dashboard">
          <p className="font-display text-3xl font-semibold">{insights.fraudDetection.riskLevel}</p>
          <p className="text-sm text-muted-foreground">{insights.fraudDetection.signalsLast7Days} recent signals</p>
        </AdminPanel>
      </div>
      <AdminPanel title="Product performance analysis">
        <div className="space-y-3">
          {insights.productPerformance.map((product) => (
            <div key={product.productId} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <span>{product.name}</span>
              <span className="text-sm text-muted-foreground">{Math.round(product.averageScore * 100)}% · {product.recommendationCount} recs</span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
