"use client";

import { Lenis } from "lenis/react";
import "lenis/dist/lenis.css";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <Lenis
      root
      options={{
        lerp: 0.085,
        wheelMultiplier: 0.92,
        touchMultiplier: 1.15,
        smoothWheel: true,
      }}
    >
      {children}
    </Lenis>
  );
}
