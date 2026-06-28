import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProfilePageClient } from "@/components/account/profile-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Profile",
  description: "Manage your NOVAEX profile, avatar, and account credentials.",
  path: "/account/profile",
});

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Profile" }]} />
      <ProfilePageClient />
    </div>
  );
}
