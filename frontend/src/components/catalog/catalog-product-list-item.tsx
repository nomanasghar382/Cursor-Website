"use client";

import Link from "next/link";
import { GitCompare, Heart, ShoppingCart, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeStore } from "@/stores/home-store";
import type { ProductCard } from "@/types/catalog";
import { cn, formatCurrency } from "@/lib/utils";

export function CatalogProductListItem({ product, search }: { product: ProductCard; search?: string }) {
  const toggleWishlist = useHomeStore((state) => state.toggleWishlist);
  const addToCart = useHomeStore((state) => state.addToCart);
  const toggleCompare = useHomeStore((state) => state.toggleCompare);
  const wishlist = useHomeStore((state) => state.wishlist);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <article className="group flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-card/50 p-4 transition hover:border-primary/30 hover:shadow-[var(--shadow-soft)] sm:flex-row">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <div
          className={cn(
            "relative h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-br sm:h-32 sm:w-32",
            product.gradient,
          )}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.badges.slice(0, 2).map((badge) => (
              <Badge key={badge} variant="accent">
                {badge}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-xl font-semibold">
            <Link href={`/products/${product.id}`} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          {search ? <p className="text-xs text-primary">Matched: {search}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Star className="h-4 w-4 fill-current" />
              {product.rating}
            </span>
            <span className="inline-flex items-center gap-1 text-primary">
              <Sparkles className="h-4 w-4" />
              {product.aiMatch}%
            </span>
            <span className="font-display text-2xl font-semibold">{formatCurrency(product.price)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Wishlist"
              onClick={() => {
                toggleWishlist(product.id);
                toast.message(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
              }}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-400")} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Compare"
              onClick={() => {
                toggleCompare(product.id);
                toast.message("Compare list updated");
              }}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => {
                addToCart(product.id);
                toast.success("Added to cart");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
