import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h2>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
    </div>
  );
}
