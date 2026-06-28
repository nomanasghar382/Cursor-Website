"use client";

import Link from "next/link";
import { ChevronDown, Menu, Moon, Search, Sparkles, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { siteConfig } from "@/config/site";
import { primaryNavigation } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/use-scroll-position";

export function SiteHeader() {
  const scrollY = useScrollPosition();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrollY > 12 ? "border-border/80 bg-background/75 backdrop-blur-2xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-[0.18em]">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item) =>
              item.children ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1">
                      {item.title}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[28rem] p-3">
                    <div className="grid gap-2">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.title} asChild className="rounded-xl p-0">
                          <Link href={child.href} className="flex items-start gap-3 rounded-xl p-3">
                            {child.icon ? (
                              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                <child.icon className="h-4 w-4" />
                              </div>
                            ) : null}
                            <div>
                              <div className="font-medium">{child.title}</div>
                              <div className="text-xs text-muted-foreground">{child.description}</div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button key={item.title} variant="ghost" asChild>
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              ),
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="glass" size="icon" aria-label="Open search" onClick={() => setCommandPaletteOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="glass"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <Button variant="glass" asChild>
              <Link href="/account">
                <User className="h-4 w-4" />
                Account
              </Link>
            </Button>
          ) : (
            <Button variant="gradient" asChild>
              <Link href="/login">
                <Sparkles className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
