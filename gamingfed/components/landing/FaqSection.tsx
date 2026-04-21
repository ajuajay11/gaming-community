"use client";

import { HelpCircle } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
import { Section } from "@/components/common/Section";
import { FAQ, type FAQItem } from "@/components/common/FAQ";

export function FaqSection() {
  const t = useTranslations("faq");
  const messages = useMessages();
  const items = (messages.faq as { items: FAQItem[] }).items;

  return (
    <Section
      eyebrow={t("eyebrow")}
      eyebrowIcon={<HelpCircle className="h-3.5 w-3.5" aria-hidden />}
      title={t("title")}
      description={t("description")}
    >
      <FAQ items={items} defaultOpen={0} tone="brand" />
    </Section>
  );
}
