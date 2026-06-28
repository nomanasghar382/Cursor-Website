"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { useRequireVendor } from "@/hooks/use-require-vendor";
import { vendorApi } from "@/lib/api/vendor";
import type { VendorOrder } from "@/types/vendor";
import { formatCurrency } from "@/lib/utils";

export function VendorOrdersClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/orders");
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.orders(token, { search, limit: 50 }).then((r) => setOrders(r.orders));
  }, [ready, token, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl font-semibold">Orders</h1><p className="text-muted-foreground">Processing, packing, shipping, and returns workflow.</p></div>
        <Input className="max-w-sm" placeholder="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
      </div>
      <AdminDataTable rows={orders} columns={[
        { key: "order", header: "Order", cell: (row) => <Link href={`/vendor/orders/${row.id}`} className="font-medium text-primary hover:underline">{row.orderNumber}</Link> },
        { key: "customer", header: "Customer", cell: (row) => row.customerName ?? row.customerEmail ?? "—" },
        { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
        { key: "total", header: "Total", cell: (row) => formatCurrency(row.grandTotal) },
        { key: "date", header: "Date", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
      ]} />
    </div>
  );
}

export function VendorCustomersClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/customers");
  const [customers, setCustomers] = useState<Array<{ id: string; email: string; name: string; orderCount: number }>>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.customers(token).then((r) => setCustomers(r.customers));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-4xl font-semibold">Customers</h1><p className="text-muted-foreground">Buyer relationships and purchase history.</p></div>
      <AdminDataTable rows={customers.map((c) => ({ ...c, id: c.id }))} columns={[
        { key: "name", header: "Customer", cell: (row) => <span className="font-medium">{row.name}</span> },
        { key: "email", header: "Email", cell: (row) => row.email },
        { key: "orders", header: "Orders", cell: (row) => String(row.orderCount) },
      ]} />
    </div>
  );
}

export function VendorReviewsClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/reviews");
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; title?: string; body: string; productName: string; customer: string }>>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.reviews(token).then((r) => setReviews(r.reviews));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-4xl font-semibold">Reviews & ratings</h1><p className="text-muted-foreground">Customer feedback across your catalog.</p></div>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-[1.25rem] border border-border/60 px-5 py-4">
            <div className="flex items-center justify-between gap-3"><p className="font-medium">{review.productName}</p><Badge variant="accent">{review.rating}/5</Badge></div>
            <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">{review.customer}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function VendorInventoryClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/inventory");
  const [inventory, setInventory] = useState<Array<{ id: string; sku: string; productName: string; warehouse: string; available: number }>>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.inventory(token).then((r) => setInventory(r.inventory));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-4xl font-semibold">Inventory</h1><p className="text-muted-foreground">Stock levels and warehouse availability.</p></div>
      <AdminDataTable rows={inventory} columns={[
        { key: "product", header: "Product", cell: (row) => row.productName },
        { key: "sku", header: "SKU", cell: (row) => row.sku },
        { key: "warehouse", header: "Warehouse", cell: (row) => row.warehouse },
        { key: "available", header: "Available", cell: (row) => <Badge variant={row.available <= 5 ? "accent" : "secondary"}>{row.available}</Badge> },
      ]} />
    </div>
  );
}
