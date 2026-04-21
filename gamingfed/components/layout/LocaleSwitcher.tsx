"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  en: "EN",
  hi: "हिं",
  ml: "മല",
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const tn = useTranslations("nav");
  const pathname = usePathname();

  return (
    <label className={cn("inline-flex items-center gap-1", className)}>
      <span className="sr-only">{tn("language")}</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value as typeof locale;
          if (next === locale) return;
          const path = !pathname || pathname === "/" ? "" : pathname;
          const url = `/${next}${path}${window.location.search}${window.location.hash}`;
          // Full page load (same as a refresh) — avoids client-only locale transitions.
          window.location.href = url;
        }}
        className={cn(
          "h-9 min-w-[3.25rem] cursor-pointer rounded-lg border border-black/10 bg-white px-1.5 text-xs font-semibold text-black",
          "dark:border-white/10 dark:bg-[#1a1d22] dark:text-white",
        )}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {LABELS[loc] ?? loc.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
