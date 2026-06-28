"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { customerApi } from "@/lib/api/customer";
import type { CustomerAddress } from "@/types/dashboard";

const emptyAddress: Omit<CustomerAddress, "id"> = {
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "",
  countryCode: "US",
  isDefault: false,
};

export function AddressesPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/addresses");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);

  const loadAddresses = async () => {
    if (!token) return;
    const result = await customerApi.addresses(token);
    setAddresses(result.addresses);
  };

  useEffect(() => {
    if (!ready || !token) return;
    void loadAddresses().finally(() => setLoading(false));
  }, [ready, token]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setDialogOpen(true);
  };

  const openEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label ?? "Home",
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      postalCode: address.postalCode ?? "",
      city: address.city ?? "",
      country: address.country ?? "",
      countryCode: address.countryCode ?? "US",
      isDefault: address.isDefault,
    });
    setDialogOpen(true);
  };

  const saveAddress = async () => {
    if (!token) return;
    if (editingId) {
      await customerApi.updateAddress(token, editingId, form);
      toast.success("Address updated");
    } else {
      await customerApi.createAddress(token, form);
      toast.success("Address added");
    }
    setDialogOpen(false);
    await loadAddresses();
  };

  const removeAddress = async (id: string) => {
    if (!token) return;
    await customerApi.deleteAddress(token, id);
    toast.success("Address removed");
    await loadAddresses();
  };

  const makeDefault = async (id: string) => {
    if (!token) return;
    await customerApi.setDefaultAddress(token, id);
    toast.success("Default address updated");
    await loadAddresses();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading addresses...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Account"
          title="Saved addresses"
          description="Manage shipping and billing destinations with validation-ready location architecture."
          icon={MapPin}
        />
        <Button variant="gradient" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          title="No addresses yet"
          description="Add your first shipping or billing address to speed up checkout."
          icon={MapPin}
          actionLabel="Add address"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, index) => (
            <motion.article
              key={address.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-4 rounded-[1.5rem] border border-border/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{address.label ?? "Address"}</p>
                    {address.isDefault ? <Badge variant="accent">Default</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {address.recipientName}
                    <br />
                    {address.line1}
                    {address.line2 ? (
                      <>
                        <br />
                        {address.line2}
                      </>
                    ) : null}
                    <br />
                    {[address.city, address.postalCode, address.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{address.phone}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!address.isDefault ? (
                  <Button size="sm" variant="outline" onClick={() => void makeDefault(address.id)}>
                    <Star className="mr-1 h-3.5 w-3.5" />
                    Set default
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => openEdit(address)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => void removeAddress(address.id)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {(["label", "recipientName", "phone", "line1", "line2", "city", "postalCode", "country"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{field}</Label>
                <Input
                  id={field}
                  value={form[field] ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                />
              </div>
            ))}
            <Button variant="gradient" onClick={() => void saveAddress()}>
              Save address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
