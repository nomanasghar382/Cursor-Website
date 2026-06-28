import { VendorCustomersClient } from "@/components/vendor/vendor-operations-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Customers", path: "/vendor/customers" });
export default function VendorCustomersPage() { return <VendorCustomersClient />; }
