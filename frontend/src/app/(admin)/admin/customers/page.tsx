import { AdminCustomersClient } from "@/components/admin/admin-people-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Customers", path: "/admin/customers" });

export default function AdminCustomersPage() {
  return <AdminCustomersClient />;
}
