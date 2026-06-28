import { VendorInventoryClient } from "@/components/vendor/vendor-operations-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Inventory", path: "/vendor/inventory" });
export default function VendorInventoryPage() { return <VendorInventoryClient />; }
