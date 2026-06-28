import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Forgot password", path: "/forgot-password", noIndex: true });

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We will email you a secure reset link.</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
