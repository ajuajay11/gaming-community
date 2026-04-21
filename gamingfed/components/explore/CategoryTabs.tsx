"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_TABS, type CategoryKey } from "./categories";
import type { GameCategory } from "@/services/types";

/**
 * Horizontal pill-tab strip for switching the listing grid between
 * categories. Lives in the URL as `?category=` so the server component can
 * refetch with the right filter — refresh-safe, shareable, SEO-friendly.
 *
 * The "All" pill clears the filter. Counts are optional and shown next to
 * each label when passed.
 */

export interface CategoryTabsProps {
  /** Optional per-category counts shown as `Label · 42`. */
  counts?: Partial<Record<CategoryKey, number>>;
  /** Path without query string. Defaults to `/explore`. */
  basePath?: string;
  /** When set, only "All" and these categories render as pills. */
  available?: GameCategory[];
}

export function CategoryTabs({
  counts,
  basePath = "/explore",
  available,
}: CategoryTabsProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const tCat = useTranslations("explore.categories");
  const tExplore = useTranslations("explore");
  const active = (params.get("category") ?? "all") as CategoryKey;

  const tabs =
    available != null && available.length > 0
      ? CATEGORY_TABS.filter(
          (t) => t.key === "all" || available.includes(t.key as GameCategory),
        )
      : CATEGORY_TABS;

  function setCategory(next: CategoryKey) {
    const search = new URLSearchParams(params.toString());
    if (next === "all") search.delete("category");
    else search.set("category", next);
    const qs = search.toString();
    startTransition(() => {
      router.replace(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  }

  return (
    <nav
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
      aria-label={tExplore("categoriesAria")}
    >
      {tabs.map(({ key, icon: Icon }) => {
        const isActive = active === key;
        const count = counts?.[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2",
              "text-xs font-semibold transition-colors",
              isActive
                ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-cyan-400/30 dark:hover:bg-white/[0.06]",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {tCat(key)}
            {typeof count === "number" && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 text-[10px]",
                  isActive
                    ? "bg-cyan-400/30 text-cyan-100"
                    : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-gray-300",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
