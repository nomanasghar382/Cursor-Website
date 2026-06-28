"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CONFIRMED: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  PROCESSING: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  SHIPPED: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  CANCELLED: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  RETURNED: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  REFUNDED: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", STATUS_STYLES[status] ?? "")}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
