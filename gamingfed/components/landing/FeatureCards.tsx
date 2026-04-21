"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ShoppingCart, Tag, ArrowRight, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AuthGate } from "@/components/common/AuthGate";

interface Card {
  href: string;
  className: string;
  Icon: LucideIcon;
  titleKey: "buyTitle" | "sellTitle";
  subtitleKey: "buySubtitle" | "sellSubtitle";
  requiresAuth?: boolean;
  promptKey?: "sellPrompt";
}

const CARD_DEFS: Card[] = [
  {
    href: "/buy",
    className: "buy-card",
    Icon: ShoppingCart,
    titleKey: "buyTitle",
    subtitleKey: "buySubtitle",
  },
  {
    href: "/sell",
    className: "sell-card",
    Icon: Tag,
    titleKey: "sellTitle",
    subtitleKey: "sellSubtitle",
    requiresAuth: true,
    promptKey: "sellPrompt",
  },
];

export function FeatureCards() {
  const t = useTranslations("featureCards");

  return (
    <div className="feature-cards">
      {CARD_DEFS.map(
        (
          {
            href,
            className,
            Icon,
            titleKey,
            subtitleKey,
            requiresAuth,
            promptKey,
          },
          index,
        ) => {
          const title = t(titleKey);
          const subtitle = t(subtitleKey);
          const inner = (
            <>
              <div className="icon">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <h4>{title}</h4>
              <div className="card-footer">
                <span>{subtitle}</span>
                <ArrowRight className="w-5 h-5" aria-hidden />
              </div>
            </>
          );
          return (
            <ScrollReveal
              key={href}
              variant="scale-in"
              delay={index * 0.12}
              className="min-w-0 h-full"
            >
              {requiresAuth ? (
                <AuthGate
                  href={href}
                  className={`feature-card ${className}`}
                  promptMessage={promptKey ? t(promptKey) : undefined}
                >
                  {inner}
                </AuthGate>
              ) : (
                <Link href={href} className={`feature-card ${className}`}>
                  {inner}
                </Link>
              )}
            </ScrollReveal>
          );
        },
      )}
    </div>
  );
}
