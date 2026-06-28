import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("Cookie Policy", "/cookies", "How NOVAEX uses cookies and similar technologies.");

export default function CookiesPage() {
  return (
    <MarketingPage title="Cookie Policy" description="Transparency about cookies on NOVAEX." path="/cookies">
      <p>We use essential cookies for authentication and session security. Analytics cookies help improve product discovery.</p>
      <p>You can manage cookie preferences in your browser settings.</p>
    </MarketingPage>
  );
}
