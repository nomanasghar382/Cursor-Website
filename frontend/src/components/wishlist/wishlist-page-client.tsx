"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GitCompare, Heart, Share2, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";
import { wishlistApi } from "@/lib/api/wishlist";
import { formatCurrency, cn } from "@/lib/utils";

export function WishlistPageClient() {
  const token = useAuthStore((state) => state.accessToken);
  const wishlists = useCommerceStore((state) => state.wishlists);
  const wishlistNotes = useCommerceStore((state) => state.wishlistNotes);
  const setWishlistNote = useCommerceStore((state) => state.setWishlistNote);
  const hydrateWishlists = useCommerceStore((state) => state.hydrateWishlists);
  const toggleWishlist = useCommerceStore((state) => state.toggleWishlist);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const toggleCompare = useCommerceStore((state) => state.toggleCompare);

  useEffect(() => {
    if (token) void hydrateWishlists(token);
  }, [token, hydrateWishlists]);

  const activeList = wishlists[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Wishlist"
        title="Curated saves, elevated"
        description="Manage multiple wishlists, notes, alerts, and premium sharing from one intelligent workspace."
      />

      {activeList ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">{activeList.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeList.itemCount} items · {activeList.analytics.views} views · {activeList.analytics.shares} shares
              </p>
            </div>
            {token ? (
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await wishlistApi.share(token, activeList.id);
                  await navigator.clipboard.writeText(`${window.location.origin}${result.shareUrl}`);
                  toast.success("Wishlist share link copied");
                }}
              >
                <Share2 className="h-4 w-4" />
                Share wishlist
              </Button>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activeList.items.map((item) => (
              <article key={item.id} className="space-y-4 rounded-[1.5rem] border border-border/60 p-5">
                <Link href={`/products/${item.productId}`}>
                  <div className={cn("h-44 overflow-hidden rounded-[1.25rem] bg-gradient-to-br", item.gradient)}>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    {item.inStock ? <Badge variant="success">In stock</Badge> : <Badge variant="secondary">Back in stock alert on</Badge>}
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    <Link href={`/products/${item.productId}`}>{item.name}</Link>
                  </h3>
                  <p className="font-display text-2xl font-semibold">{formatCurrency(item.price)}</p>
                </div>
                <Textarea
                  placeholder="Add a wishlist note..."
                  value={wishlistNotes[item.id] ?? ""}
                  onChange={(event) => setWishlistNote(item.id, event.target.value)}
                  aria-label={`Note for ${item.name}`}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="gradient"
                    disabled={!item.variantId}
                    onClick={() => item.variantId && void addToCart({ token, variantId: item.variantId, productId: item.productId })}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Move to cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleCompare(item.productId)}>
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void toggleWishlist({ token, productId: item.productId, variantId: item.variantId })}
                  >
                    <Heart className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-border/70 p-10 text-center">
          <p className="text-lg font-medium">Your wishlist is waiting for its first premium pick.</p>
          <Button asChild className="mt-4" variant="gradient">
            <Link href="/products">Discover products</Link>
          </Button>
        </div>
      )}

      <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Wishlist intelligence
        </div>
        Price drop and back-in-stock alerts are active for saved items. Analytics update as you share and revisit lists.
      </div>
    </div>
  );
}
