import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AccountSidebar } from "@/components/layout/account-sidebar";
import { AnimatedBackground } from "@/components/motion/animated-background";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[280px_1fr]">
        <AccountSidebar />
        <main>{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
