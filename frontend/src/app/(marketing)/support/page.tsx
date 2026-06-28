import Link from "next/link";
import { MarketingPage, marketingPageMetadata } from "@/components/marketing/marketing-page";
import { Button } from "@/components/ui/button";

export const metadata = marketingPageMetadata("Help Center", "/support", "Get help with orders, account, and enterprise features.");

export default function SupportPage() {
  return (
    <MarketingPage title="Help Center" description="Answers and support for NOVAEX customers." path="/support">
      <p>Browse orders in your account dashboard or contact our support team for order, payment, and security questions.</p>
      <Button asChild variant="gradient" className="mt-4">
        <Link href="/account/orders">View orders</Link>
      </Button>
    </MarketingPage>
  );
}
