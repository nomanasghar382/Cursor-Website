import { Breadcrumb } from "@/components/common/breadcrumb";
import { PaymentsPageClient } from "@/components/account/payments-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Payments",
  description: "View payment methods, transactions, and billing history.",
  path: "/account/payments",
});

export default function PaymentsPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Payments" }]} />
      <PaymentsPageClient />
    </div>
  );
}
