"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { primaryNavigation } from "@/config/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useUiStore } from "@/stores/ui-store";

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, pages, and AI actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => router.push("/products")}>Browse catalog</CommandItem>
          <CommandItem onSelect={() => router.push("/ai")}>Open AI studio</CommandItem>
          <CommandItem onSelect={() => router.push("/account")}>Account center</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Discover">
          {primaryNavigation.flatMap((item) => item.children ?? [{ title: item.title, href: item.href }]).map((entry) => (
            <CommandItem key={entry.href} onSelect={() => router.push(entry.href)}>
              {entry.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
