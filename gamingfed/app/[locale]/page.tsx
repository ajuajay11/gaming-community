import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { TrendingGames } from "@/components/landing/TrendingGames";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustStats } from "@/components/landing/TrustStats";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { gameService } from "@/services";
import type { GameCatalogEntry } from "@/services/types";

export const revalidate = 60;

export default async function HomePage() {
  const tc = await getTranslations("homeCta");
  let trending: GameCatalogEntry[] = [];
  try {
    const { games } = await gameService.getTrending({ limit: 8 });
    trending = games;
  } catch {
    trending = [];
  }

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <HeroSection />
      <Suspense fallback={null}>
        <FeatureCards />
      </Suspense>
      <ScrollReveal variant="fade-up" className="block">
        <TrendingGames games={trending} />
      </ScrollReveal>
      <ScrollReveal variant="fade-up" delay={0.06} className="block">
        <HowItWorks />
      </ScrollReveal>
      {/* <TrustStats /> */}
      <ScrollReveal variant="fade-up" delay={0.08} className="block">
        <FaqSection />
      </ScrollReveal>
      <ScrollReveal variant="scale-in" delay={0.04} className="block">
        <CtaBanner
          eyebrow={tc("eyebrow")}
          title={tc("title")}
          description={tc("description")}
          primary={{ href: "/explore", label: tc("primary") }}
          secondary={{ href: "/sell", label: tc("secondary") }}
        />
      </ScrollReveal>
    </main>
  );
}
