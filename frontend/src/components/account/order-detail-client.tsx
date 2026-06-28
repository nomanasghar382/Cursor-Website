"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderSummary } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const token = useAuthStore((state) => state.accessToken);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    void ordersApi.getById(token, orderId).then((result) => setOrder(result.order));
  }, [token, orderId]);

  if (!order) return <p className="text-muted-foreground">Loading order...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">{order.orderNumber}</h1>
          <Badge className="mt-2" variant="secondary">
            {order.status}
          </Badge>
        </div>
        <p className="font-display text-3xl font-semibold">{formatCurrency(order.grandTotal)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {order.timeline?.map((step) => (
          <div
            key={step.key}
            className={`rounded-[1.25rem] border px-4 py-3 ${step.current ? "border-primary bg-primary/5" : "border-border/60"}`}
          >
            <p className="font-medium">{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.completed ? "Completed" : step.current ? "In progress" : "Upcoming"}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-border/60 p-5">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatCurrency(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <Button asChild variant="outline">
        <Link href="/account/orders">Back to orders</Link>
      </Button>
    </div>
  );
}
