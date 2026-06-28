import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "NOVAEX enterprise admin command center.",
  path: "/admin",
});

export default function AdminPage() {
  return <AdminDashboardClient />;
}
