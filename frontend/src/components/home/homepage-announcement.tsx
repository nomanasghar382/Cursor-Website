"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/home/announcement-bar";

export function HomepageAnnouncement() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <AnnouncementBar />;
}
