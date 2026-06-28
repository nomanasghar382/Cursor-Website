import { VendorProductsClient } from "@/components/vendor/vendor-catalog-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Products", path: "/vendor/products" });
export default function VendorProductsPage() { return <VendorProductsClient />; }
