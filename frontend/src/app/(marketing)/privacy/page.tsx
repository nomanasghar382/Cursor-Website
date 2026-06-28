import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata(
  "Privacy Policy",
  "/privacy",
  "How NOVAEX collects, uses, and protects your data.",
);

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy Policy"
      description="Your privacy matters. This policy explains how NOVAEX handles personal data across our commerce platform."
      path="/privacy"
    >
      <p>
        NOVAEX collects account information, order history, and usage analytics to deliver personalized commerce
        experiences. We do not sell personal data to third parties.
      </p>
      <p>
        Payment data is processed by PCI-compliant providers. You may request data export or deletion by contacting
        support@novaex.ai.
      </p>
    </MarketingPage>
  );
}
