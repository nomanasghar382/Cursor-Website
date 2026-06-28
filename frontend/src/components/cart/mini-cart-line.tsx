"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";
import type { CartLine } from "@/types/commerce";
import { cn, formatCurrency } from "@/lib/utils";

export function MiniCartLine({ item, compact = false }: { item: CartLine; compact?: boolean }) {
  const token = useAuthStore((state) => state.accessToken);
  const updateCartQuantity = useCommerceStore((state) => state.updateCartQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);

  return (
    <div className={cn("flex gap-4", compact ? "py-2" : "rounded-[1.25rem] border border-border/60 p-4")}>
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <div className={cn("overflow-hidden rounded-2xl bg-gradient-to-br", item.gradient, compact ? "h-16 w-16" : "h-24 w-24")}>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary">
            {item.name}
          </Link>
          <p className="text-xs text-muted-foreground">{item.sku}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-border p-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Decrease quantity"
              onClick={() => void updateCartQuantity(token, item.variantId, Math.max(1, item.quantity - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-8 text-center text-sm">{item.quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Increase quantity"
              onClick={() => void updateCartQuantity(token, item.variantId, Math.min(item.stock, item.quantity + 1))}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-display text-lg font-semibold">{formatCurrency(item.lineTotal)}</p>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Remove item"
              onClick={() => void removeFromCart(token, item.variantId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
