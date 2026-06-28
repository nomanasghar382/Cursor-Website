import { AdminVendorsClient } from "@/components/admin/admin-people-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Vendors", path: "/admin/vendors" });

export default function AdminVendorsPage() {
  return <AdminVendorsClient />;
}
