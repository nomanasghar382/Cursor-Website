import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Reset password", path: "/reset-password", noIndex: true });

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use at least 8 characters with mixed complexity.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
