import { Breadcrumb } from "@/components/common/breadcrumb";
import { SettingsPageClient } from "@/components/account/settings-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Settings",
  description: "Theme, language, currency, and accessibility preferences.",
  path: "/account/settings",
});

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Settings" }]} />
      <SettingsPageClient />
    </div>
  );
}
