"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminNavigation } from "@/config/admin-navigation";
import { useAdminUiStore } from "@/stores/admin-ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl transition-all lg:block",
        collapsed ? "w-[88px]" : "w-[280px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
        {!collapsed ? <p className="font-display text-lg font-semibold">NOVAEX Admin</p> : <p className="font-display text-lg font-semibold">NX</p>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="space-y-1 p-3">
        {adminNavigation.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              title={item.title}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.title}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
