import { VendorDashboardClient } from "@/components/vendor/vendor-dashboard-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Dashboard", path: "/vendor" });

export default function VendorPage() {
  return <VendorDashboardClient />;
}
