import { Breadcrumb } from "@/components/common/breadcrumb";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cart",
  description: "Review your NOVAEX cart, savings, and premium checkout recommendations.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <CartPageClient />
    </div>
  );
}
