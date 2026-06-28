import { AdminAiClient } from "@/components/admin/admin-ai-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin AI", path: "/admin/ai" });

export default function AdminAiPage() {
  return <AdminAiClient />;
}
