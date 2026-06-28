"use client";

import { useRouter } from "next/navigation";
import { adminNavigation, adminQuickActions } from "@/config/admin-navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAdminUiStore } from "@/stores/admin-ui-store";

export function AdminCommandPalette() {
  const router = useRouter();
  const open = useAdminUiStore((state) => state.commandPaletteOpen);
  const setOpen = useAdminUiStore((state) => state.setCommandPaletteOpen);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search admin pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {adminNavigation.map((item) => (
            <CommandItem key={item.href} onSelect={() => router.push(item.href)}>
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          {adminQuickActions.map((action) => (
            <CommandItem key={action.href} onSelect={() => router.push(action.href)}>
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
