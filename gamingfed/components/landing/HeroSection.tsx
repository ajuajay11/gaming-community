"use client";

import { useTranslations } from "next-intl";
import { GameShowcase } from "./GameShowcase";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { MorphingText } from "@/components/ui/morphing-text";

const HERO_DIA_COLORS = ["#67e8f9", "#22d3ee", "#06b6d4", "#a5f3fc", "#0e7490"];

const SHOWCASE_KEYS = ["gta", "pubg", "football", "valorant", "freeFire"] as const;

export function HeroSection() {
  const t = useTranslations("hero");
  const ts = useTranslations("showcase");
  const morphTexts = SHOWCASE_KEYS.map((k) => ts(k));

  return (
    <section className="hero">
      <div className="hero-header hero-header--enter flex w-full flex-col items-center px-1 pt-1 text-center">
        <div className="hero-tagline mx-auto max-w-2xl px-2 text-center text-[clamp(0.9rem,2.4vw,1.125rem)] font-medium leading-snug text-gray-300 md:max-w-3xl">
          <h1 className="no-scrollbar m-0 flex max-w-[100vw] flex-nowrap items-baseline justify-center gap-x-2 overflow-x-auto whitespace-nowrap text-[clamp(0.95rem,2.8vw,1.6rem)] px-1 [-webkit-overflow-scrolling:touch]">
            <span className="shrink-0 font-bold text-gray-100">{t("brandLine")}</span>
            <DiaTextReveal
              text={t("diaWord")}
              textColor="#e5e7eb"
              colors={HERO_DIA_COLORS}
              className="font-semibold text-white"
            />
          </h1>
        </div>
        <MorphingText
          texts={morphTexts}
          className="mt-6 h-10 max-w-[min(100%,36rem)] px-2 text-[clamp(0.95rem,3.2vw,1.5rem)] font-extrabold tracking-tight text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.28)] md:mt-7 md:h-14 md:max-w-4xl md:text-[clamp(1rem,2.8vw,1.75rem)] lg:h-16 lg:text-[clamp(1.05rem,2.5vw,1.9rem)]"
        />
      </div>

      <GameShowcase />

      <ScrollReveal variant="fade-up" className="hero-footer">
        <h3>{t("footerTitle")}</h3>
        <p>{t("footerLine")}</p>
      </ScrollReveal>
    </section>
  );
}
