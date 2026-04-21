"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

export type ScrollRevealVariant =
  | "fade-up"
  | "fade-down"
  | "slide-left"
  | "slide-right"
  | "scale-in";

const variantClass: Record<ScrollRevealVariant, string> = {
  "fade-up": "scroll-reveal--fade-up",
  "fade-down": "scroll-reveal--fade-down",
  "slide-left": "scroll-reveal--slide-left",
  "slide-right": "scroll-reveal--slide-right",
  "scale-in": "scroll-reveal--scale-in",
};

export function ScrollReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  once = true,
  rootMargin = "0px 0px -10% 0px",
}: {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  /** Stagger offset in seconds (passed as transition-delay). */
  delay?: number;
  once?: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          el.classList.add("scroll-reveal--visible");
          if (once) obs.disconnect();
        } else if (!once) {
          el.classList.remove("scroll-reveal--visible");
        }
      },
      { threshold: 0, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin]);

  const style: CSSProperties | undefined =
    delay > 0
      ? {
          transitionDelay: `${delay}s`,
        }
      : undefined;

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", variantClass[variant], className)}
      style={style}
    >
      {children}
    </div>
  );
}

/** Attach reveal classes + observer to an existing element (e.g. `.game-item`). */
export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  {
    variant = "fade-up",
    delay = 0,
    once = true,
    rootMargin = "0px 0px -10% 0px",
  }: {
    variant?: ScrollRevealVariant;
    delay?: number;
    once?: boolean;
    rootMargin?: string;
  } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("scroll-reveal", variantClass[variant]);
    if (delay > 0) el.style.transitionDelay = `${delay}s`;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          el.classList.add("scroll-reveal--visible");
          if (once) obs.disconnect();
        } else if (!once) {
          el.classList.remove("scroll-reveal--visible");
        }
      },
      { threshold: 0, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [variant, delay, once, rootMargin]);
}
