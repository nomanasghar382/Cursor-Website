import { Breadcrumb } from "@/components/common/breadcrumb";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Account Dashboard",
  description: "Your premium NOVAEX customer command center.",
  path: "/account",
});

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Account" }]} />
      <DashboardPageClient />
    </div>
  );
}
