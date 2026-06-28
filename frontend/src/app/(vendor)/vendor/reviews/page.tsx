import { VendorReviewsClient } from "@/components/vendor/vendor-operations-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Reviews", path: "/vendor/reviews" });
export default function VendorReviewsPage() { return <VendorReviewsClient />; }
