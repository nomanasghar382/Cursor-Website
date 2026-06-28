import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import { Building2 } from "lucide-react";

export const metadata = buildMetadata({ title: "Enterprise", path: "/enterprise" });

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <PageHeader
        eyebrow="Enterprise"
        title="Built for operators, vendors, and security teams"
        description="Role-based access, audit trails, session governance, and AI merchandising controls for large-scale commerce."
        icon={Building2}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {[
          "Vendor and admin audience login routes",
          "Authorization APIs for roles and permissions",
          "Security logs, MFA, and account lock controls",
        ].map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-lg">{item}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Integrated with the NOVAEX NestJS enterprise backend and PostgreSQL data platform.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
