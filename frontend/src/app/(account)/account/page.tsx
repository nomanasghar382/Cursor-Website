import { Shield, Sparkles, UserRound } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Account", path: "/account" });

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Your NOVAEX command center"
        description="Manage profile, security posture, and AI shopping preferences from one premium surface."
        icon={UserRound}
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            MFA, trusted devices, session revocation, and password lifecycle controls.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tune recommendation confidence, category affinity, and assistant tone.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Enterprise order history, fulfillment status, and invoice access.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
