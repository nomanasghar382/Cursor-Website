"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderSummary } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

export function OrdersPageClient() {
  const token = useAuthStore((state) => state.accessToken);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (!token) return;
    void ordersApi.list(token).then((result) => setOrders(result.orders));
  }, [token]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Your orders" description="Track payment status, fulfillment, and delivery across your NOVAEX purchases." />
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-border/60 p-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <p className="font-medium">{order.orderNumber}</p>
                <Badge variant="secondary">{order.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.itemCount ?? order.items?.length ?? 0} items · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-display text-2xl font-semibold">{formatCurrency(order.grandTotal)}</p>
              <Button asChild variant="outline">
                <Link href={`/account/orders/${order.id}`}>View</Link>
              </Button>
            </div>
          </article>
        ))}
        {orders.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> : null}
      </div>
    </div>
  );
}
