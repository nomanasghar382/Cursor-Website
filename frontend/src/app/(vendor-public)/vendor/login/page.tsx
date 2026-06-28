import { Suspense } from "react";
import { VendorLoginForm } from "@/components/vendor/vendor-login-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Vendor Login", path: "/vendor/login" });

export default function VendorLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Suspense><VendorLoginForm /></Suspense>
    </div>
  );
}
