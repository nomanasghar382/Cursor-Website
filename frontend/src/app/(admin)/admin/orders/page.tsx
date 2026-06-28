import { AdminOrdersClient } from "@/components/admin/admin-orders-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Orders", path: "/admin/orders" });

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
