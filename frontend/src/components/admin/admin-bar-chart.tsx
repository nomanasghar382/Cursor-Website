"use client";

import { cn } from "@/lib/utils";

export function AdminBarChart({
  data,
  valueKey,
  labelKey,
  className,
}: {
  data: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
  className?: string;
}) {
  const max = Math.max(...data.map((entry) => Number(entry[valueKey]) || 0), 1);

  return (
    <div className={cn("flex h-48 items-end gap-2", className)} role="img" aria-label="Bar chart">
      {data.map((entry) => {
        const value = Number(entry[valueKey]) || 0;
        const height = `${Math.max((value / max) * 100, 4)}%`;
        return (
          <div key={String(entry[labelKey])} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary transition-all"
                style={{ height }}
                title={`${entry[labelKey]}: ${value}`}
              />
            </div>
            <span className="max-w-full truncate text-[10px] text-muted-foreground">{String(entry[labelKey]).slice(5, 10)}</span>
          </div>
        );
      })}
    </div>
  );
}
