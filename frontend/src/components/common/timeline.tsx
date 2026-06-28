import { cn } from "@/lib/utils";

export type TimelineItem = {
  title: string;
  description: string;
  timestamp: string;
  active?: boolean;
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("space-y-6", className)}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="relative pl-8">
          <span
            className={cn(
              "absolute left-0 top-1.5 h-3 w-3 rounded-full border",
              item.active ? "border-primary bg-primary shadow-[var(--shadow-glow)]" : "border-border bg-muted",
            )}
          />
          {index < items.length - 1 ? <span className="absolute left-[5px] top-5 h-[calc(100%+0.5rem)] w-px bg-border" /> : null}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-medium">{item.title}</h3>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
