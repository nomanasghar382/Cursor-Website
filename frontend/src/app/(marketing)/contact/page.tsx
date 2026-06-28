import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("Contact", "/contact", "Get in touch with NOVAEX.");

export default function ContactPage() {
  return (
    <MarketingPage title="Contact" description="We would love to hear from you." path="/contact">
      <p>General: hello@novaex.ai</p>
      <p>Support: support@novaex.ai</p>
      <p>Enterprise: enterprise sales via the Enterprise page.</p>
    </MarketingPage>
  );
}
