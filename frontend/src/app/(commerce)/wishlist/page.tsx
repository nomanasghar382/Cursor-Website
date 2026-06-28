import { Breadcrumb } from "@/components/common/breadcrumb";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Wishlist",
  description: "Manage premium wishlists, notes, alerts, and sharing on NOVAEX.",
  path: "/wishlist",
});

export default function WishlistPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <WishlistPageClient />
    </div>
  );
}
