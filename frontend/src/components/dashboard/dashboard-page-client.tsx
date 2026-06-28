"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { customerApi } from "@/lib/api/customer";
import { useAuthStore } from "@/stores/auth-store";
import type { DashboardData } from "@/types/dashboard";

export function DashboardPageClient() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/login?next=/account");
      return;
    }
    void customerApi
      .dashboard(token)
      .then(setData)
      .finally(() => setLoading(false));
  }, [hydrated, token, router]);

  return <DashboardOverview data={data} loading={loading} />;
}
