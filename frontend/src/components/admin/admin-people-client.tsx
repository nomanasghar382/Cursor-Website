"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";
import type { AdminCustomer, AdminVendor } from "@/types/admin";

export function AdminCustomersClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/customers");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.customers(token, { search, limit: 50 }).then((result) => setCustomers(result.customers)).finally(() => setLoading(false));
  }, [ready, token, search]);

  if (loading) return <p className="text-muted-foreground">Loading customers...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Customer management</h1>
          <p className="text-muted-foreground">Profiles, purchase history, rewards, and account status.</p>
        </div>
        <Input className="max-w-sm" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" />
      </div>
      <AdminDataTable
        rows={customers}
        columns={[
          { key: "name", header: "Customer", cell: (row) => <span className="font-medium">{row.name}</span> },
          { key: "email", header: "Email", cell: (row) => row.email },
          { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
          { key: "orders", header: "Orders", cell: (row) => String(row.orderCount) },
          { key: "wishlists", header: "Wishlist", cell: (row) => String(row.wishlistCount) },
          { key: "joined", header: "Joined", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}

export function AdminVendorsClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/vendors");
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.vendors(token, { search, limit: 50 }).then((result) => setVendors(result.vendors)).finally(() => setLoading(false));
  }, [ready, token, search]);

  if (loading) return <p className="text-muted-foreground">Loading vendors...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Vendor management</h1>
          <p className="text-muted-foreground">Registration, approval, performance, and payout architecture.</p>
        </div>
        <Input className="max-w-sm" placeholder="Search vendors" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search vendors" />
      </div>
      <AdminDataTable
        rows={vendors}
        columns={[
          { key: "name", header: "Vendor", cell: (row) => <span className="font-medium">{row.displayName}</span> },
          { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
          { key: "kyc", header: "KYC", cell: (row) => <Badge variant="accent">{row.kycStatus}</Badge> },
          { key: "stores", header: "Stores", cell: (row) => String(row.storeCount) },
          { key: "users", header: "Users", cell: (row) => String(row.userCount) },
          { key: "joined", header: "Joined", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
