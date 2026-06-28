"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">We could not complete this request. Try again or return to the storefront.</p>
      <Button variant="gradient" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
