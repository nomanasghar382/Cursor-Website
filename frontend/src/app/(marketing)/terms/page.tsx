import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";

export const metadata = marketingPageMetadata("Terms of Service", "/terms", "Terms governing use of the NOVAEX platform.");

export default function TermsPage() {
  return (
    <MarketingPage title="Terms of Service" description="Please read these terms carefully before using NOVAEX." path="/terms">
      <p>By using NOVAEX you agree to our acceptable use, payment, and vendor marketplace policies.</p>
      <p>Orders are subject to availability, verification, and regional compliance requirements.</p>
    </MarketingPage>
  );
}
