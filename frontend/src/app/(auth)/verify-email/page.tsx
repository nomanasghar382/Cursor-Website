import { Suspense } from "react";
import { VerifyEmailClient } from "@/features/auth/components/verify-email-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Verify email", path: "/verify-email", noIndex: true });

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">Confirm your NOVAEX account to unlock full access.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
