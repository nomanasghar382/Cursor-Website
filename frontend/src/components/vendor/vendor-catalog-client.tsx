"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPanel } from "@/components/admin/admin-stat-card";
import { useRequireVendor } from "@/hooks/use-require-vendor";
import { vendorApi } from "@/lib/api/vendor";
import type { VendorProduct, VendorStore } from "@/types/vendor";
import { formatCurrency } from "@/lib/utils";

export function VendorProductsClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/products");
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [search, setSearch] = useState("");
  const [aiName, setAiName] = useState("");
  const [aiOutput, setAiOutput] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.products(token, { search, limit: 50 }).then((r) => setProducts(r.products));
  }, [ready, token, search]);

  const generateAi = async () => {
    if (!token || !aiName) return;
    const result = await vendorApi.generateAi(token, { productName: aiName, tone: "premium" });
    setAiOutput(`${result.description}\n\nSEO: ${result.seoTitle}`);
    toast.success("AI content generated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl font-semibold">Products</h1><p className="text-muted-foreground">Create, edit, and optimize your catalog.</p></div>
        <Input className="max-w-sm" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
      </div>
      <AdminPanel title="AI product description generator">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-2"><Label htmlFor="ai-product">Product name</Label><Input id="ai-product" value={aiName} onChange={(e) => setAiName(e.target.value)} /></div>
          <Button className="self-end" variant="gradient" onClick={() => void generateAi()}>Generate</Button>
        </div>
        {aiOutput ? <Textarea className="mt-4" value={aiOutput} readOnly aria-label="Generated AI content" /> : null}
      </AdminPanel>
      <AdminDataTable rows={products} columns={[
        { key: "name", header: "Product", cell: (row) => <span className="font-medium">{row.name}</span> },
        { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
        { key: "price", header: "Price", cell: (row) => formatCurrency(row.basePrice) },
        { key: "variants", header: "Variants", cell: (row) => String(row.variantCount) },
        { key: "media", header: "Media", cell: (row) => `${row.imageCount} img · ${row.videoCount} vid` },
        { key: "ai", header: "AI", cell: (row) => `${Math.round(row.aiScore)}%` },
      ]} />
    </div>
  );
}

export function VendorStoreClient() {
  const { token, ready } = useRequireVendor("/vendor/login?next=/vendor/store");
  const [store, setStore] = useState<VendorStore | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    void vendorApi.store(token).then((r) => { setStore(r.store); setName(r.store.name); setDescription(r.store.description ?? ""); });
  }, [ready, token]);

  const save = async () => {
    if (!token) return;
    const result = await vendorApi.updateStore(token, { name, description });
    setStore(result.store);
    toast.success("Store updated");
  };

  if (!store) return <p className="text-muted-foreground">Loading store...</p>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-4xl font-semibold">Store management</h1><p className="text-muted-foreground">Brand identity, SEO, policies, and verification status.</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Store profile">
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="store-name">Store name</Label><Input id="store-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="store-desc">Description</Label><Textarea id="store-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button variant="gradient" onClick={() => void save()}>Save store</Button>
          </div>
        </AdminPanel>
        <AdminPanel title="Verification & status">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Store status</span><Badge variant="secondary">{store.status}</Badge></div>
            <div className="flex justify-between"><span>KYC status</span><Badge variant="accent">{store.vendor.kycStatus}</Badge></div>
            <div className="flex justify-between"><span>Vacation mode</span><Badge variant={store.vacationMode ? "accent" : "secondary"}>{store.vacationMode ? "On" : "Off"}</Badge></div>
            <div className="flex justify-between"><span>Theme</span><span>{store.theme}</span></div>
            <div className="flex justify-between"><span>SEO title</span><span className="text-right">{store.seoTitle}</span></div>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
