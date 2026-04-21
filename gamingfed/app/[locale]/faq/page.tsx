import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";

type FaqItem = { q: string; a: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faqPage");
  const messages = await getMessages();
  const items = (messages.faqPage as { items: FaqItem[] }).items;

  return (
    <LegalLayout title={t("title")} subtitle={t("subtitle")}>
      <ul className="divide-y divide-white/10 -mt-4">
        {items.map((item) => (
          <li key={item.q} className="py-5">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-white font-semibold">
                <span className="pr-4">{item.q}</span>
                <span
                  aria-hidden
                  className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-sm transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-gray-300 leading-relaxed">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </LegalLayout>
  );
}
