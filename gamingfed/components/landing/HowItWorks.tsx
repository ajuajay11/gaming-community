"use client";

import { Search, ShieldCheck, MessageCircle, Wallet } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
import { Section } from "@/components/common/Section";
import {
  Card,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";

const STEP_ICONS = [
  <Search key="s" className="h-5 w-5" aria-hidden />,
  <ShieldCheck key="sh" className="h-5 w-5" aria-hidden />,
  <MessageCircle key="m" className="h-5 w-5" aria-hidden />,
  <Wallet key="w" className="h-5 w-5" aria-hidden />,
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");
  const messages = useMessages();
  const stepMsgs = (messages.howItWorks as { steps: { title: string; copy: string }[] })
    .steps;
  const steps = stepMsgs.map((s, i) => ({
    icon: STEP_ICONS[i],
    title: s.title,
    copy: s.copy,
  }));

  return (
    <Section
      eyebrow={t("eyebrow")}
      title={
        <>
          {t("titleBefore")}
          <span className="brand-text">{t("titleBrand")}</span>
          {t("titleAfter")}
        </>
      }
      description={t("description")}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {steps.map((s) => (
          <Card key={s.title} tone="default" padding="lg">
            <CardIcon tone="brand">{s.icon}</CardIcon>
            <CardHeader className="mt-4">
              <CardTitle as="h3" className="text-base">
                {s.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {s.copy}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
}
