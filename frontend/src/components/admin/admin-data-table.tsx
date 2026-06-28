"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage = "No records found.",
  className,
}: {
  rows: T[];
  columns: AdminTableColumn<T>[];
  emptyMessage?: string;
  className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/70 px-6 py-16 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] border border-border/60", className)}>
      <div className="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] border-b border-border/60 bg-secondary/40 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground" style={{ ["--cols" as string]: columns.length }}>
        {columns.map((column) => (
          <div key={column.key} className={column.className}>
            {column.header}
          </div>
        ))}
      </div>
      <div ref={parentRef} className="max-h-[520px] overflow-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                className="absolute left-0 top-0 grid w-full grid-cols-[repeat(var(--cols),minmax(0,1fr))] border-b border-border/40 px-4 py-3 text-sm hover:bg-secondary/30"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  ["--cols" as string]: columns.length,
                }}
              >
                {columns.map((column) => (
                  <div key={column.key} className={cn("flex items-center", column.className)}>
                    {column.cell(row)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
