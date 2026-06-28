import { Breadcrumb } from "@/components/common/breadcrumb";
import { SecurityPageClient } from "@/components/account/security-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Security",
  description: "MFA, sessions, and account protection controls.",
  path: "/account/security",
});

export default function SecurityPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Security" }]} />
      <SecurityPageClient />
    </div>
  );
}
