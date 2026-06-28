"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!email || !token) return;
    setStatus("loading");
    void authApi
      .verifyEmail({ email, token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [email, token]);

  if (!email || !token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Verification link is invalid.</p>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (status === "loading" || status === "idle") {
    return <p className="text-center text-muted-foreground">Verifying your email...</p>;
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-destructive">Verification failed or the link expired.</p>
        <Button
          variant="outline"
          onClick={() => {
            void authApi.resendVerification(email).then(() => toast.success("Verification email sent."));
          }}
        >
          Resend verification
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-lg font-medium">Email verified successfully.</p>
      <Button variant="gradient" onClick={() => router.push("/login")}>
        Continue to sign in
      </Button>
    </div>
  );
}
