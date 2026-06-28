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

export function TrendingProductCard({ product }: { product: ProductCard }) {
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
        <Card className="group overflow-hidden border-white/10 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
          <CardHeader className="space-y-4">
            <div className={cn("relative flex h-52 items-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-5", product.gradient)}>
              <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/15" />
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="glass"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast.message(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
                  }}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-400")} />
                </Button>
                <Button size="icon" variant="glass" aria-label="Quick view" onClick={() => setQuickViewOpen(true)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative space-y-2">
                <Badge variant="accent">{product.badge}</Badge>
                <CardTitle className="text-white">{product.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="inline-flex items-center gap-1 text-amber-300">
                <Star className="h-4 w-4 fill-current" />
                {product.rating}
              </div>
              <div className="inline-flex items-center gap-1 text-primary">
                <Sparkles className="h-4 w-4" />
                {product.aiMatch}% match
              </div>
            </div>
            <Badge variant={product.stock > 0 ? "success" : "secondary"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Backorder"}
            </Badge>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
              <p className="font-display text-2xl font-semibold">{formatCurrency(product.price)}</p>
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
                Compare
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
          </CardFooter>
        </Card>
      </TiltCard>

      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          <div className={cn("h-56 rounded-[1.5rem] bg-gradient-to-br", product.gradient)} />
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
