"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ordersApi } from "@/lib/api/orders";
import type { OrderSummary } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

export function OrdersPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/orders");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void ordersApi.list(token).then((result) => setOrders(result.orders)).finally(() => setLoading(false));
  }, [ready, token]);

  if (loading) {
    return <p className="text-muted-foreground">Loading orders...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Your orders" description="Track payment status, fulfillment, and delivery across your NOVAEX purchases." icon={Package} />
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
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you complete a purchase, your order history will appear here."
            icon={Package}
            actionLabel="Browse catalog"
            onAction={() => {
              window.location.href = "/products";
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

