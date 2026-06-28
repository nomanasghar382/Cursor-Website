import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "@/features/auth/components/login-form";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({ title: "Sign in", path: "/login" });

export default function LoginPage() {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-display text-3xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your NOVAEX account with enterprise-grade security.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </>
  );
}
