"use client";

import Link from "next/link";
import { primaryNavigation } from "@/config/navigation";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useUiStore } from "@/stores/ui-store";

export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigate NOVAEX</DrawerTitle>
        </DrawerHeader>
        <nav className="space-y-2 px-4 pb-8">
          {primaryNavigation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block rounded-xl px-4 py-3 text-lg hover:bg-secondary"
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
