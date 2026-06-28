import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <CardHeader>
          <div className={`rounded-[1.5rem] bg-gradient-to-br ${gradient} p-6 text-white`}>
            <Icon className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardTitle className="flex items-center justify-between text-xl">
            {title}
            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
