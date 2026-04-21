"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Flame } from "lucide-react";
import type { GameCatalogEntry } from "@/services/types";
import { CatalogCard } from "@/components/listings/CatalogCard";

export interface TrendingGamesProps {
  games: GameCatalogEntry[];
}

export function TrendingGames({ games }: TrendingGamesProps) {
  const t = useTranslations("trending");
  if (!games?.length) return null;
  return (
    <section className="mt-10 md:mt-14">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Flame className="w-4 h-4" aria-hidden />
            <span className="uppercase tracking-[0.2em] text-xs font-semibold">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold">{t("title")}</h2>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white transition"
        >
          {t("viewAll")}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {games.map((g) => (
          <CatalogCard key={g.name} entry={g} />
        ))}
      </div>
    </section>
  );
}
