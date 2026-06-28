"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Laptop, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { PreferenceToggle } from "@/components/account/preference-toggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { authApi } from "@/lib/api/auth";

type Session = { id: string; ipAddress?: string; userAgent?: string; createdAt: string };

export function SecurityPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/security");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [providers, setProviders] = useState<Record<string, unknown>>({});
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    const [dashboard, sessionResult, providerResult] = await Promise.all([
      authApi.securityDashboard(token),
      authApi.sessions(token),
      authApi.oauthProviders(),
    ]);
    setMfaEnabled(dashboard.settings.mfaEnabled);
    setSecurityNotifications(dashboard.settings.securityNotificationsEnabled);
    setSessions(sessionResult.sessions);
    setProviders(providerResult);
  };

  useEffect(() => {
    if (!ready || !token) return;
    void load().finally(() => setLoading(false));
  }, [ready, token]);

  const startMfaSetup = async () => {
    if (!token) return;
    const result = await authApi.setupMfa(token);
    setSetupSecret(result.secret);
    setBackupCodes(result.backupCodes);
    toast.success("Scan the secret in your authenticator app, then enter the code to enable MFA.");
  };

  const enableMfa = async () => {
    if (!token) return;
    await authApi.enableMfa(token, mfaCode);
    setMfaEnabled(true);
    setMfaCode("");
    toast.success("Multi-factor authentication enabled");
    await load();
  };

  const disableMfa = async () => {
    if (!token) return;
    await authApi.disableMfa(token, { mfaCode });
    setMfaEnabled(false);
    setMfaCode("");
    toast.success("Multi-factor authentication disabled");
    await load();
  };

  const toggleSecurityNotifications = async (checked: boolean) => {
    if (!token) return;
    setSecurityNotifications(checked);
    await authApi.updateSecuritySettings(token, { securityNotificationsEnabled: checked });
    toast.success("Security notification preference updated");
  };

  const revokeSession = async (sessionId: string) => {
    if (!token) return;
    await authApi.revokeSession(token, sessionId);
    toast.success("Session revoked");
    await load();
  };

  const revokeAllSessions = async () => {
    if (!token) return;
    await authApi.revokeAllSessions(token);
    toast.success("All other sessions revoked");
    await load();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading security dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Security"
        title="Security dashboard"
        description="Monitor authentication posture, trusted devices, and account protection controls."
        icon={Shield}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard label="MFA status" value={mfaEnabled ? "Enabled" : "Disabled"} active={mfaEnabled} />
        <StatusCard label="Active sessions" value={String(sessions.length)} active={sessions.length > 0} />
        <StatusCard label="Connected providers" value={String(Object.keys(providers).length)} active />
      </div>

      <PreferenceToggle
        id="security-notifications"
        label="Security notifications"
        description="Alert me about suspicious sign-ins and credential changes."
        checked={securityNotifications}
        onCheckedChange={(checked) => void toggleSecurityNotifications(checked)}
      />

      <Accordion type="single" collapsible className="glass-panel rounded-[2rem] px-6">
        <AccordionItem value="mfa">
          <AccordionTrigger>Multi-factor authentication</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-6">
            <p className="text-sm text-muted-foreground">
              Protect your account with TOTP-based MFA and one-time backup codes.
            </p>
            {mfaEnabled ? (
              <div className="space-y-3">
                <Badge variant="success">MFA active</Badge>
                <div className="space-y-2">
                  <Label htmlFor="disable-mfa-code">Authenticator code</Label>
                  <Input id="disable-mfa-code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} />
                </div>
                <Button variant="outline" onClick={() => void disableMfa()}>
                  Disable MFA
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="gradient" onClick={() => void startMfaSetup()}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Start MFA setup
                </Button>
                {setupSecret ? (
                  <div className="space-y-3 rounded-[1.25rem] border border-border/60 p-4 text-sm">
                    <p>
                      Secret: <code className="rounded bg-muted px-2 py-1">{setupSecret}</code>
                    </p>
                    {backupCodes.length > 0 ? (
                      <p>Backup codes: {backupCodes.join(", ")}</p>
                    ) : null}
                    <div className="space-y-2">
                      <Label htmlFor="enable-mfa-code">Verification code</Label>
                      <Input id="enable-mfa-code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} />
                    </div>
                    <Button onClick={() => void enableMfa()}>Enable MFA</Button>
                  </div>
                ) : null}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sessions">
          <AccordionTrigger>Active sessions</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-6">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => void revokeAllSessions()}>
                Sign out everywhere
              </Button>
            </div>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border/60 p-2">
                    {session.userAgent?.toLowerCase().includes("mobile") ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{session.userAgent ?? "Unknown device"}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.ipAddress ?? "Unknown IP"} · {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void revokeSession(session.id)}>
                  Revoke
                </Button>
              </motion.div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="connected">
          <AccordionTrigger>Connected accounts</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-6">
            {Object.keys(providers).length === 0 ? (
              <p className="text-sm text-muted-foreground">No OAuth providers are configured.</p>
            ) : (
              Object.keys(providers).map((provider) => (
                <div
                  key={provider}
                  className="flex items-center justify-between rounded-[1.25rem] border border-border/60 px-4 py-3"
                >
                  <p className="capitalize">{provider}</p>
                  <Badge variant="secondary">Available</Badge>
                </div>
              ))
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function StatusCard({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="rounded-[1.5rem] border border-border/60 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      <Badge className="mt-3" variant={active ? "success" : "secondary"}>
        {active ? "Healthy" : "Action needed"}
      </Badge>
    </div>
  );
}
