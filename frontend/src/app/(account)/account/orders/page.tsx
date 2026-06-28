import { Breadcrumb } from "@/components/common/breadcrumb";
import { OrdersPageClient } from "@/components/account/orders-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Orders",
  description: "View your NOVAEX order history, status, and invoices.",
  path: "/account/orders",
});

export default function AccountOrdersPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Orders" }]} />
      <OrdersPageClient />
    </div>
  );
}
