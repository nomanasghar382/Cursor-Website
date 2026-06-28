"use client";

import { useRouter } from "next/navigation";
import { vendorNavigation, vendorQuickActions } from "@/config/vendor-navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAdminUiStore } from "@/stores/admin-ui-store";

export function VendorCommandPalette() {
  const router = useRouter();
  const open = useAdminUiStore((state) => state.commandPaletteOpen);
  const setOpen = useAdminUiStore((state) => state.setCommandPaletteOpen);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search seller portal..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {vendorNavigation.map((item) => (
            <CommandItem key={item.href} onSelect={() => router.push(item.href)}>{item.title}</CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          {vendorQuickActions.map((action) => (
            <CommandItem key={action.href} onSelect={() => router.push(action.href)}>{action.label}</CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
