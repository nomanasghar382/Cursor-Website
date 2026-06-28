"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "@/components/admin/admin-stat-card";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { adminApi } from "@/lib/api/admin";

export function AdminSystemClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/system");
  const [roles, setRoles] = useState<unknown[]>([]);
  const [flags, setFlags] = useState<Array<{ key: string; enabled: boolean; description?: string }>>([]);
  const [logs, setLogs] = useState<unknown[]>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([adminApi.roles(token), adminApi.featureFlags(token), adminApi.auditLogs(token)]).then(
      ([roleResult, flagResult, logResult]) => {
        setRoles(roleResult.roles);
        setFlags(flagResult.flags);
        setLogs(logResult.logs);
      },
    );
  }, [ready, token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">System management</h1>
        <p className="text-muted-foreground">Roles, feature flags, audit logs, and platform configuration.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Roles">
          <div className="space-y-3">
            {roles.map((role) => {
              const entry = role as { id: string; name: string; slug: string; _count?: { userRoles: number } };
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                  <span className="font-medium">{entry.name}</span>
                  <Badge variant="secondary">{entry._count?.userRoles ?? 0} users</Badge>
                </div>
              );
            })}
          </div>
        </AdminPanel>
        <AdminPanel title="Feature flags">
          <div className="space-y-3">
            {flags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="font-medium">{flag.key}</p>
                  {flag.description ? <p className="text-xs text-muted-foreground">{flag.description}</p> : null}
                </div>
                <Badge variant={flag.enabled ? "success" : "secondary"}>{flag.enabled ? "Enabled" : "Disabled"}</Badge>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
      <AdminPanel title="Audit logs">
        <div className="space-y-3">
          {logs.map((log) => {
            const entry = log as { id: string; action: string; entityType: string; createdAt: string };
            return (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm">
                <span>
                  {entry.action} · {entry.entityType}
                </span>
                <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}

export function AdminInventoryClient() {
  const { token, ready } = useRequireAdmin("/admin/login?next=/admin/inventory");
  const [inventory, setInventory] = useState<Array<{ id: string; sku: string; productName: string; warehouse: string; quantityAvailable: number }>>([]);

  useEffect(() => {
    if (!ready || !token) return;
    void adminApi.inventory(token).then((result) => setInventory(result.inventory as typeof inventory));
  }, [ready, token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Inventory overview</h1>
        <p className="text-muted-foreground">Warehouse stock, reorder levels, and availability signals.</p>
      </div>
      <div className="space-y-3">
        {inventory.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.sku} · {item.warehouse}
              </p>
            </div>
            <Badge variant={item.quantityAvailable <= 5 ? "accent" : "secondary"}>{item.quantityAvailable} available</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
