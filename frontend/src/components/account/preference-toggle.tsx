"use client";

import { cn } from "@/lib/utils";

export function PreferenceToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-border/60 px-4 py-4">
      <div className="space-y-1">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
