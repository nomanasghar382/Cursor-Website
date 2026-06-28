import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomepageAnnouncement } from "@/components/home/homepage-announcement";
import { CommandPalette } from "@/components/search/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AnimatedBackground } from "@/components/motion/animated-background";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <HomepageAnnouncement />
      <SiteHeader />
      <main className="relative">{children}</main>
      <SiteFooter />
      <CommandPalette />
      <MobileNav />
    </div>
  );
}
