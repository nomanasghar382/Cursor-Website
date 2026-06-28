import { VendorPayoutsClient } from "@/components/vendor/vendor-finance-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Payouts", path: "/vendor/payouts" });
export default function VendorPayoutsPage() { return <VendorPayoutsClient />; }
