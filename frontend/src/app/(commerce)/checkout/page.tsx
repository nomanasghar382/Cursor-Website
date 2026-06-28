import { Breadcrumb } from "@/components/common/breadcrumb";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Complete your premium NOVAEX checkout with secure payment and AI-assisted savings.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <CheckoutPageClient />
    </div>
  );
}
