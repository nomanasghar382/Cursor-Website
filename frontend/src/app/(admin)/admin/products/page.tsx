import { AdminProductsClient } from "@/components/admin/admin-products-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Admin Products", path: "/admin/products" });

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
