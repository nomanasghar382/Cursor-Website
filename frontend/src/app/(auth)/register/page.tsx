import { buildMetadata } from "@/lib/seo";
import { RegisterForm } from "@/features/auth/components/register-form";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({ title: "Create account", path: "/register" });

export default function RegisterPage() {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-display text-3xl">Create your account</CardTitle>
        <CardDescription>Join NOVAEX and unlock AI-native commerce experiences.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </>
  );
}
