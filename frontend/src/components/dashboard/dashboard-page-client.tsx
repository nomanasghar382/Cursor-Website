"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ErrorState } from "@/components/common/state-panels";
import { customerApi } from "@/lib/api/customer";
import { useAuthStore } from "@/stores/auth-store";
import type { DashboardData } from "@/types/dashboard";

export function DashboardPageClient() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    void customerApi
      .dashboard(token)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/login?next=/account");
      return;
    }
    load();
  }, [hydrated, token, router]);

  if (error && !loading) {
    return <ErrorState title="Dashboard unavailable" description="We could not load your account overview." onRetry={load} />;
  }

  return <DashboardOverview data={data} loading={loading} />;
}
