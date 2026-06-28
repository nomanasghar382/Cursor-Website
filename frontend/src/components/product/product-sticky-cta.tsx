"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHomeStore } from "@/stores/home-store";
import type { ProductDetail } from "@/types/catalog";
import { formatCurrency } from "@/lib/utils";

export function ProductStickyCta({ product }: { product: ProductDetail }) {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const addToCart = useHomeStore((state) => state.addToCart);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(100%,42rem)] items-center justify-between gap-4 rounded-full border border-border/70 bg-background/90 px-4 py-3 shadow-[var(--shadow-glow)] backdrop-blur-xl"
      role="region"
      aria-label="Quick purchase"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{product.name}</p>
        <p className="font-display text-lg font-semibold">{formatCurrency(product.price)}</p>
      </div>
      <Button
        variant="gradient"
        onClick={() => addToCart(product.id)}
        disabled={product.stock <= 0}
      >
        <ShoppingCart className="h-4 w-4" />
        Add to cart
      </Button>
    </motion.div>
  );
}
