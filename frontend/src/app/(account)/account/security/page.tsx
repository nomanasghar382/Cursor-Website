import { Shield } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Security", path: "/account/security" });

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Security"
        title="Security dashboard"
        description="Monitor authentication posture, trusted devices, and account protection controls."
        icon={Shield}
      />
      <Accordion type="single" collapsible className="glass-panel rounded-[2rem] px-6">
        <AccordionItem value="mfa">
          <AccordionTrigger>Multi-factor authentication</AccordionTrigger>
          <AccordionContent>
            Enable TOTP-based MFA with backup codes and security notifications on suspicious login events.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sessions">
          <AccordionTrigger>Active sessions</AccordionTrigger>
          <AccordionContent>
            Review signed-in devices, revoke individual sessions, and sign out everywhere instantly.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="password">
          <AccordionTrigger>Password policy</AccordionTrigger>
          <AccordionContent>
            Password history enforcement, expiration windows, and secure reset flows are managed by the NOVAEX auth service.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
