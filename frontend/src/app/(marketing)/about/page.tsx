import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("About NOVAEX", "/about", "The AI-native commerce platform for premium brands.");

export default function AboutPage() {
  return (
    <MarketingPage
      title="About NOVAEX"
      description="We build enterprise-grade commerce with AI-native discovery, vendor marketplaces, and operational intelligence."
      path="/about"
    >
      <p>NOVAEX combines premium storefront experiences with vendor operations, fulfillment, and growth tooling in one platform.</p>
    </MarketingPage>
  );
}
