import { VendorAiClient } from "@/components/vendor/vendor-finance-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor AI Studio", path: "/vendor/ai" });
export default function VendorAiPage() { return <VendorAiClient />; }
