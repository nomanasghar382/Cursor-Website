import { VendorAnalyticsClient } from "@/components/vendor/vendor-finance-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Analytics", path: "/vendor/analytics" });
export default function VendorAnalyticsPage() { return <VendorAnalyticsClient />; }
