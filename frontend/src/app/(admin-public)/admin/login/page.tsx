import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the NOVAEX enterprise admin panel.",
  path: "/admin/login",
});

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
