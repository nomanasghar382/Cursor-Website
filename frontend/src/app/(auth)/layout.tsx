import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { AnimatedBackground } from "@/components/motion/animated-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-4 py-16 md:px-6">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="hidden glass-panel-strong lg:block">
            <CardHeader>
              <CardTitle className="font-display text-3xl">Secure by design</CardTitle>
              <CardDescription>
                Enterprise authentication with MFA, refresh rotation, device trust, and zero-trust session controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Built for millions of users with argon2 password hashing, RBAC, and audit-ready security events.</p>
              <Link href="/enterprise" className="inline-flex text-primary hover:underline">
                Explore enterprise capabilities
              </Link>
            </CardContent>
          </Card>
          <Card className="glass-panel-strong">{children}</Card>
        </div>
      </div>
    </div>
  );
}
