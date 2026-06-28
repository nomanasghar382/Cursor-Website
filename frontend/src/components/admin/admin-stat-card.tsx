"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] border border-border/60 bg-card/50 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl border border-border/60 bg-primary/10 p-2.5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        {trend ? <span className="text-xs text-emerald-400">{trend}</span> : null}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  );
}

export function AdminPanel({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-4 rounded-[1.75rem] border border-border/60 bg-card/30 p-6", className)}>
      <div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
