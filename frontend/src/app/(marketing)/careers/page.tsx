import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("Careers", "/careers", "Join the NOVAEX team.");

export default function CareersPage() {
  return (
    <MarketingPage title="Careers" description="Help us redefine AI-native commerce." path="/careers">
      <p>We are hiring across engineering, design, and go-to-market. Email hello@novaex.ai with your portfolio.</p>
    </MarketingPage>
  );
}
