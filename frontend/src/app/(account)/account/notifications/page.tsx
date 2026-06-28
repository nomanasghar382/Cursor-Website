import { Breadcrumb } from "@/components/common/breadcrumb";
import { NotificationsPageClient } from "@/components/account/notifications-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Notifications",
  description: "View alerts and manage notification preferences.",
  path: "/account/notifications",
});

export default function NotificationsPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Notifications" }]} />
      <NotificationsPageClient />
    </div>
  );
}
