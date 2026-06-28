"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Package, RotateCcw, Truck } from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { OrderStatusBadge } from "@/components/fulfillment/order-status-badge";
import { OrderTrackingPanel } from "@/components/fulfillment/order-tracking-panel";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { fulfillmentAdminApi } from "@/lib/api/fulfillment";
import type { OrderDetail, OrderTracking, FulfillmentAnalytics } from "@/types/fulfillment";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const ADMIN_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"];

export function AdminOrderDetailClient({ orderId }: { orderId: string }) {
  const { token, ready } = useRequireAdmin(`/admin/login?next=/admin/orders/${orderId}`);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [note, setNote] = useState("");

  const load = async () => {
    if (!token) return;
    const result = await fulfillmentAdminApi.getOrder(token, orderId);
    setOrder(result.order);
  };

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, orderId]);

  if (!order) return <p className="text-muted-foreground">Loading order...</p>;

  const tracking: OrderTracking = {
    orderNumber: order.orderNumber,
    status: order.status,
    timeline: order.timeline,
    shipments: order.shipments ?? [],
    estimatedDeliveryDays: order.estimatedDeliveryDays,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">{order.orderNumber}</h1>
          <p className="text-muted-foreground">{order.customerEmail}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        {ADMIN_STATUSES.map((status) => (
          <Button
            key={status}
            size="sm"
            variant="outline"
            onClick={async () => {
              if (!token) return;
              await fulfillmentAdminApi.updateStatus(token, orderId, status);
              toast.success(`Order moved to ${status}`);
              await load();
            }}
          >
            Mark {status.replaceAll("_", " ")}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={async () => {
            if (!token) return;
            await fulfillmentAdminApi.refund(token, orderId, { reason: "Admin refund" });
            toast.success("Refund processed");
            await load();
          }}
        >
          Process refund
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (!token) return;
            const shipment = order.shipments?.[0];
            if (!shipment) return;
            await fulfillmentAdminApi.updateShipment(token, shipment.id, {
              status: "IN_TRANSIT",
              trackingNumber: shipment.trackingNumber ?? `NX-${Date.now()}`,
              message: "Package is out for delivery",
            });
            toast.success("Shipment updated");
            await load();
          }}
        >
          Mark out for delivery
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal order note" />
        <Button
          onClick={async () => {
            if (!token || !note.trim()) return;
            await fulfillmentAdminApi.addNote(token, orderId, note);
            setNote("");
            toast.success("Note added");
            await load();
          }}
        >
          Add note
        </Button>
      </div>

      <OrderTrackingPanel tracking={tracking} />

      <Button asChild variant="outline">
        <Link href="/admin/orders">Back to orders</Link>
      </Button>
    </div>
  );
}

export function AdminOrdersClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/orders");
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [analytics, setAnalytics] = useState<FulfillmentAnalytics | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    Promise.all([
      fulfillmentAdminApi.listOrders(token, { search: search || undefined, status: status || undefined, limit: 50 }),
      fulfillmentAdminApi.analytics(token),
    ])
      .then(([orderResult, analyticsResult]) => {
        setOrders(orderResult.orders);
        setAnalytics(analyticsResult);
      })
      .finally(() => setLoading(false));
  }, [ready, token, search, status]);

  if (loading) return <p className="text-muted-foreground">Loading orders...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Order management</h1>
          <p className="text-muted-foreground">Fulfillment, payments, shipping, refunds, and analytics.</p>
        </div>
        <Input className="max-w-sm" placeholder="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {analytics ? (
        <div className="grid gap-4 md:grid-cols-4">
          <AdminStatCard icon={RotateCcw} label="Refund volume" value={formatCurrency(analytics.refunds.amount)} hint={`${analytics.refunds.count} refunds`} />
          <AdminStatCard icon={CreditCard} label="Captured payments" value={String(analytics.payments.find((p) => p.status === "CAPTURED")?.count ?? 0)} />
          <AdminStatCard icon={Truck} label="In transit" value={String(analytics.shipments.find((s) => s.status === "IN_TRANSIT")?.count ?? 0)} />
          <AdminStatCard icon={Package} label="Delivered orders" value={String(analytics.orders.find((o) => o.status === "DELIVERED")?.count ?? 0)} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["", ...ADMIN_STATUSES].map((filter) => (
          <Badge
            key={filter || "all"}
            className="cursor-pointer"
            variant={status === filter ? "default" : "secondary"}
            onClick={() => setStatus(filter)}
          >
            {filter ? filter.replaceAll("_", " ") : "All"}
          </Badge>
        ))}
      </div>

      <AdminDataTable
        rows={orders}
        columns={[
          {
            key: "order",
            header: "Order",
            cell: (row) => (
              <Link href={`/admin/orders/${row.id}`} className="font-medium text-primary hover:underline">
                {row.orderNumber}
              </Link>
            ),
          },
          { key: "customer", header: "Customer", cell: (row) => row.customerEmail ?? "—" },
          { key: "status", header: "Status", cell: (row) => <OrderStatusBadge status={row.status} /> },
          { key: "items", header: "Items", cell: (row) => String(row.itemCount) },
          { key: "total", header: "Total", cell: (row) => formatCurrency(row.grandTotal) },
          { key: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
