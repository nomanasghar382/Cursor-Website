"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HeroScene = dynamic(() => import("@/components/three/hero-scene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full rounded-[2rem]" />,
});

export function HeroSceneCanvas() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-[2rem]" />}>
      <HeroScene />
    </Suspense>
  );
}
