import { AdminContentClient } from "@/components/admin/admin-sections-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Content", path: "/admin/content" });

export default function AdminContentPage() {
  return <AdminContentClient />;
}
