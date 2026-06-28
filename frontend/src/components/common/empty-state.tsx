import { LucideIcon, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/40 px-6 text-center">
      <div className="mb-4 rounded-2xl border border-border bg-secondary/60 p-4 text-muted-foreground">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
