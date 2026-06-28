"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, GitCompare, Heart, ShoppingCart, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiltCard } from "@/components/home/tilt-card";
import { useHomeStore } from "@/stores/home-store";
import type { ProductCard } from "@/types/catalog";
import { cn, formatCurrency } from "@/lib/utils";

function highlightSearch(text: string, search?: string) {
  if (!search?.trim()) return text;
  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index} className="rounded bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function CatalogProductCard({
  product,
  search,
  compact = false,
}: {
  product: ProductCard;
  search?: string;
  compact?: boolean;
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const wishlist = useHomeStore((state) => state.wishlist);
  const compareList = useHomeStore((state) => state.compareList);
  const toggleWishlist = useHomeStore((state) => state.toggleWishlist);
  const addToCart = useHomeStore((state) => state.addToCart);
  const toggleCompare = useHomeStore((state) => state.toggleCompare);
  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareList.includes(product.id);

  return (
    <>
      <TiltCard>
        <Card
          className={cn(
            "group overflow-hidden border-white/10 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]",
            compact && "scale-[0.98]",
          )}
        >
          <CardHeader className="space-y-4">
            <Link href={`/products/${product.id}`} className="block">
              <div
                className={cn(
                  "relative flex items-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-5",
                  product.gradient,
                  compact ? "h-40" : "h-52",
                )}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/15" />
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="glass"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={(event) => {
                      event.preventDefault();
                      toggleWishlist(product.id);
                      toast.message(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-400")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="glass"
                    aria-label="Quick view"
                    onClick={(event) => {
                      event.preventDefault();
                      setQuickViewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative flex flex-wrap gap-2">
                  {product.badges.slice(0, 2).map((badge) => (
                    <Badge key={badge} variant={badge.includes("AI") ? "accent" : "secondary"}>
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
              <CardTitle className="text-lg">
                <Link href={`/products/${product.id}`} className="hover:text-primary">
                  {highlightSearch(product.name, search)}
                </Link>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            {product.colors.length > 0 ? (
              <div className="flex flex-wrap gap-2" aria-label="Available colors">
                {product.colors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {color}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex items-center justify-between text-sm">
              <div className="inline-flex items-center gap-1 text-amber-300">
                <Star className="h-4 w-4 fill-current" />
                {product.rating}
                <span className="text-muted-foreground">({product.reviewCount})</span>
              </div>
              <div className="inline-flex items-center gap-1 text-primary">
                <Sparkles className="h-4 w-4" />
                {product.aiMatch}%
              </div>
            </div>
            <Badge variant={product.stock > 0 ? "success" : "secondary"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Backorder"}
            </Badge>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</p>
              ) : null}
              <p className="font-display text-2xl font-semibold">{formatCurrency(product.price)}</p>
              {product.discountPercent ? (
                <p className="text-xs font-medium text-emerald-400">Save {product.discountPercent}%</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toggleCompare(product.id);
                  toast.message(isCompared ? "Removed from compare" : "Added to compare");
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
                Add
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TiltCard>

      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          <div className={cn("relative h-56 overflow-hidden rounded-[1.5rem] bg-gradient-to-br", product.gradient)}>
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-display text-3xl font-semibold">{formatCurrency(product.price)}</p>
            <Button asChild variant="gradient">
              <Link href={`/products/${product.id}`}>View full details</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
