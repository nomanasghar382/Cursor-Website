import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Analytics", path: "/admin/analytics" });

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsClient />;
}
