"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/use-magnetic";

export function MagneticButton({ children, ...props }: ButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>();

  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  );
}
