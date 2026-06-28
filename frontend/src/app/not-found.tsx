import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-primary">404</p>
      <h1 className="font-display text-5xl font-semibold">This page drifted off course</h1>
      <p className="text-muted-foreground">The experience you requested is not available or may have moved.</p>
      <Button variant="gradient" asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
