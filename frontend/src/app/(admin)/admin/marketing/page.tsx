import { AdminMarketingClient } from "@/components/admin/admin-sections-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Marketing", path: "/admin/marketing" });

export default function AdminMarketingPage() {
  return <AdminMarketingClient />;
}
