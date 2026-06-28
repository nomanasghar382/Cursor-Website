"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminProduct } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";

export function AdminProductsClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.products(token, { search, limit: 50 }).then((result) => setProducts(result.products)).finally(() => setLoading(false));
  }, [ready, token, search]);

  if (loading) return <p className="text-muted-foreground">Loading products...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Product management</h1>
          <p className="text-muted-foreground">Catalog, variants, inventory, and approval workflows.</p>
        </div>
        <Input className="max-w-sm" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
      </div>
      <AdminDataTable
        rows={products}
        columns={[
          { key: "name", header: "Product", cell: (row) => <span className="font-medium">{row.name}</span> },
          { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
          { key: "category", header: "Category", cell: (row) => row.category?.name ?? "—" },
          { key: "price", header: "Price", cell: (row) => formatCurrency(row.basePrice) },
          { key: "variants", header: "Variants", cell: (row) => String(row.variantCount) },
          { key: "ai", header: "AI score", cell: (row) => `${Math.round(row.aiScore)}%` },
        ]}
      />
    </div>
  );
}
