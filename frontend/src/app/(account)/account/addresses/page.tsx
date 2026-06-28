import { Breadcrumb } from "@/components/common/breadcrumb";
import { AddressesPageClient } from "@/components/account/addresses-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Addresses",
  description: "Manage your shipping and billing addresses.",
  path: "/account/addresses",
});

export default function AddressesPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Addresses" }]} />
      <AddressesPageClient />
    </div>
  );
}
