"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, Heart, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MiniCartLine } from "@/components/cart/mini-cart-line";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { productsApi } from "@/lib/api/products";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";
import { formatCurrency } from "@/lib/utils";
import type { ProductCard } from "@/types/catalog";

export function CartPageClient() {
  const token = useAuthStore((state) => state.accessToken);
  const cart = useCommerceStore((state) => state.cart);
  const hydrateCart = useCommerceStore((state) => state.hydrateCart);
  const saveForLater = useCommerceStore((state) => state.saveForLater);
  const moveSavedToCart = useCommerceStore((state) => state.moveSavedToCart);
  const [recommendations, setRecommendations] = useState<ProductCard[]>([]);

  useEffect(() => {
    if (token) void hydrateCart(token);
  }, [token, hydrateCart]);

  useEffect(() => {
    void productsApi.list({ section: "featured", limit: 3 }).then((result) => setRecommendations(result.products));
  }, []);

  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.estimatedTax ?? 0;
  const shipping = cart?.shippingEstimate ?? 0;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Cart"
        title="Your premium cart"
        description="Review intelligent recommendations, savings opportunities, and fulfillment estimates before checkout."
      />

      <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {cart?.items.length ? (
            cart.items.map((item) => (
              <div key={item.id} className="space-y-3 rounded-[1.5rem] border border-border/60 p-4">
                <MiniCartLine item={item} />
                <div className="flex flex-wrap gap-2">
                  {token ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => void saveForLater(token, item.variantId)}>
                        <Bookmark className="h-4 w-4" />
                        Save for later
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void useCommerceStore.getState().toggleWishlist({ token, productId: item.productId, variantId: item.variantId });
                          toast.message("Moved to wishlist");
                        }}
                      >
                        <Heart className="h-4 w-4" />
                        Move to wishlist
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 p-10 text-center">
              <p className="text-lg font-medium">Your cart is empty.</p>
              <Button asChild className="mt-4" variant="gradient">
                <Link href="/products">Continue shopping</Link>
              </Button>
            </div>
          )}

          {cart?.savedForLater.length ? (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Saved for later</h2>
              {cart.savedForLater.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] border border-border/60 p-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.lineTotal)}</p>
                  </div>
                  {token ? (
                    <Button size="sm" variant="outline" onClick={() => void moveSavedToCart(token, item.variantId)}>
                      Move to cart
                    </Button>
                  ) : null}
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 rounded-[2rem] border border-border/60 bg-card/40 p-6 backdrop-blur-xl lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping estimate</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-display text-xl font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal + tax + shipping)}</span>
            </div>
          </div>

          {cart?.aiSuggestions[0] ? (
            <div className="rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI suggestion
              </div>
              {cart.aiSuggestions[0]}
            </div>
          ) : null}

          <Button asChild variant="gradient" size="lg" className="w-full" disabled={!cart?.items.length}>
            <Link href="/checkout">
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </div>

      {recommendations.length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold">Recommended for your cart</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}