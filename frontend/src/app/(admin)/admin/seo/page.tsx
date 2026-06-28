import { AdminSeoClient } from "@/components/admin/admin-growth-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin SEO", path: "/admin/seo" });

export default function AdminSeoPage() {
  return <AdminSeoClient />;
}
