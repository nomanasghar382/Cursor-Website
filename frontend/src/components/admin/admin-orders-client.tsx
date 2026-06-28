"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminOrder } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";

export function AdminOrdersClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.orders(token, { search, limit: 50 }).then((result) => setOrders(result.orders)).finally(() => setLoading(false));
  }, [ready, token, search]);

  if (loading) return <p className="text-muted-foreground">Loading orders...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Order management</h1>
          <p className="text-muted-foreground">Fulfillment, returns, refunds, and invoice operations.</p>
        </div>
        <Input className="max-w-sm" placeholder="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
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
          { key: "customer", header: "Customer", cell: (row) => row.customerName ?? row.customerEmail ?? "—" },
          { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
          { key: "items", header: "Items", cell: (row) => String(row.itemCount) },
          { key: "total", header: "Total", cell: (row) => formatCurrency(row.grandTotal) },
          { key: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
