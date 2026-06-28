import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl space-y-4">
        {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">{eyebrow}</p> : null}
        <div className="flex items-start gap-4">
          {Icon ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          ) : null}
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
            {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
