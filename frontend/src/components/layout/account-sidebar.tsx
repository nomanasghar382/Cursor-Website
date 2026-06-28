"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel rounded-[2rem] p-4">
      <nav className="space-y-1">
        {accountNavigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
