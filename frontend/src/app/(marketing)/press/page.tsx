import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("Press", "/press", "NOVAEX press and media resources.");

export default function PressPage() {
  return (
    <MarketingPage title="Press" description="Media inquiries and brand assets." path="/press">
      <p>For press and partnership inquiries, contact hello@novaex.ai.</p>
    </MarketingPage>
  );
}
