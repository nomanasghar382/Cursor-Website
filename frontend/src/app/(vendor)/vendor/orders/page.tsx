import { VendorOrdersClient } from "@/components/vendor/vendor-operations-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Orders", path: "/vendor/orders" });
export default function VendorOrdersPage() { return <VendorOrdersClient />; }
