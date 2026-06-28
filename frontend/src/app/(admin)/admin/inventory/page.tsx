import { AdminInventoryClient } from "@/components/admin/admin-sections-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Inventory", path: "/admin/inventory" });

export default function AdminInventoryPage() {
  return <AdminInventoryClient />;
}
