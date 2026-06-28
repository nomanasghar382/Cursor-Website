"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles, X } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MiniCartLine } from "@/components/cart/mini-cart-line";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";
import { formatCurrency } from "@/lib/utils";

export function MiniCartDrawer() {
  const prefersReducedMotion = useReducedMotion();
  const token = useAuthStore((state) => state.accessToken);
  const open = useCommerceStore((state) => state.drawerOpen);
  const setOpen = useCommerceStore((state) => state.setDrawerOpen);
  const cart = useCommerceStore((state) => state.cart);
  const guestCart = useCommerceStore((state) => state.guestCart);
  const recentlyRemoved = useCommerceStore((state) => state.recentlyRemoved);
  const undoRemove = useCommerceStore((state) => state.undoRemove);
  const itemCount = useCommerceStore((state) => state.cartCount());

  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shippingEstimate ?? (subtotal >= 150 ? 0 : 19.95);
  const tax = cart?.estimatedTax ?? subtotal * 0.08875;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="flex items-center gap-2 font-display text-2xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your cart ({itemCount})
          </DrawerTitle>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost" aria-label="Close cart">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-6 overflow-y-auto px-4 pb-8">
          {recentlyRemoved ? (
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
              <span>Removed {recentlyRemoved.name}</span>
              <Button size="sm" variant="outline" onClick={() => void undoRemove(token)}>
                Undo
              </Button>
            </div>
          ) : null}

          {cart?.items.length ? (
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: 40 }}
                >
                  <MiniCartLine item={item} compact />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : guestCart.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {guestCart.length} guest item(s) ready. Sign in at checkout to sync across devices.
            </p>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 p-8 text-center">
              <p className="font-medium">Your cart is ready for something extraordinary.</p>
              <Button asChild className="mt-4" variant="gradient">
                <Link href="/products">Browse catalog</Link>
              </Button>
            </div>
          )}

          {cart?.aiSuggestions[0] ? (
            <div className="rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI cart insight
              </div>
              {cart.aiSuggestions[0]}
            </div>
          ) : null}

          {cart && cart.items.length > 0 ? (
            <>
              <Separator />
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
                <div className="flex justify-between font-display text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal + tax + shipping)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild variant="gradient" size="lg">
                  <Link href="/checkout">
                    Secure checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
