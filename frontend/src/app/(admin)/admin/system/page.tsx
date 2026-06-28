import { AdminSystemClient } from "@/components/admin/admin-sections-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin System", path: "/admin/system" });

export default function AdminSystemPage() {
  return <AdminSystemClient />;
}
