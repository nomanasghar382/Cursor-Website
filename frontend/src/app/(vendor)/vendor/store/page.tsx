import { VendorStoreClient } from "@/components/vendor/vendor-catalog-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Store", path: "/vendor/store" });
export default function VendorStorePage() { return <VendorStoreClient />; }
