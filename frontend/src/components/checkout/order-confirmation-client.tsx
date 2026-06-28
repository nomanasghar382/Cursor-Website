"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderSummary } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

export function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const prefersReducedMotion = useReducedMotion();
  const token = useAuthStore((state) => state.accessToken);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    void ordersApi.getById(token, orderId).then((result) => setOrder(result.order));
  }, [token, orderId]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-center">
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      <div className="space-y-3">
        <h1 className="font-display text-5xl font-semibold">Order confirmed</h1>
        <p className="text-lg text-muted-foreground">
          {order
            ? `Thank you. Order ${order.orderNumber} is now entering NOVAEX fulfillment.`
            : "Your premium order is being confirmed."}
        </p>
      </div>
      {order ? (
        <div className="rounded-[2rem] border border-border/60 bg-card/40 p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-display text-2xl font-semibold">{formatCurrency(order.grandTotal)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Estimated delivery in {order.estimatedDeliveryDays} business days
          </p>
          {order.invoiceNumber ? <p className="text-sm">Invoice {order.invoiceNumber}</p> : null}
        </div>
      ) : null}
      <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm">
        <div className="mb-2 flex items-center justify-center gap-2 font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          What happens next
        </div>
        You will receive confirmation email and in-app notifications as your order moves through payment capture, processing, and shipment.
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="gradient">
          <Link href={token ? `/account/orders/${orderId}` : "/products"}>View order details</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
