"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const object = { val: 0 };
    const tween = gsap.to(object, {
      val: value,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => setDisplay(Math.round(object.val)),
    });
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
