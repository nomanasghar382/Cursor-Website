import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CommandPalette } from "@/components/search/command-palette";
import { AnimatedBackground } from "@/components/motion/animated-background";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { AiAssistantWidget } from "@/components/ai/ai-assistant-widget";

export default function CommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">{children}</main>
      <SiteFooter />
      <CommandPalette />
      <MiniCartDrawer />
      <AiAssistantWidget />
    </div>
  );
}
