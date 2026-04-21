"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic, brand-agnostic FAQ accordion. Pass an `items` array and it does
 * the rest — keyboard-accessible, motion-free, theme-aware. Use for any
 * Q&A list (home page, pricing page, help centre, etc.).
 *
 * Only one item can be open at a time; clicking the open row collapses it.
 * Pass `defaultOpen` (index) to pre-expand the first question for demo
 * screenshots or SEO snippet bait.
 */
export interface FAQItem {
  q: string;
  a: React.ReactNode;
}

export interface FAQProps {
  items: FAQItem[];
  defaultOpen?: number;
  className?: string;
  /** Render with brand-tinted chrome (matches home-page hero). */
  tone?: "default" | "brand";
}

export function FAQ({
  items,
  defaultOpen,
  className,
  tone = "default",
}: FAQProps) {
  const [open, setOpen] = React.useState<number | null>(defaultOpen ?? null);

  return (
    <ul
      className={cn(
        "divide-y overflow-hidden rounded-2xl border",
        tone === "brand"
          ? "divide-cyan-200/60 border-cyan-200/70 bg-white/80 dark:divide-white/5 dark:border-cyan-400/20 dark:bg-white/[0.02]"
          : "divide-slate-200 border-slate-200 bg-white dark:divide-white/5 dark:border-white/10 dark:bg-white/[0.02]",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `faq-${i}`;
        return (
          <li key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              id={`${id}-button`}
              onClick={() => setOpen(isOpen ? null : i)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
                "text-sm font-semibold text-slate-900 transition-colors dark:text-white",
                "hover:bg-slate-50/80 dark:hover:bg-white/[0.04]",
              )}
            >
              <span>{item.q}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-gray-400",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-button`}
              hidden={!isOpen}
              className="px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600 dark:text-gray-300"
            >
              {item.a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
