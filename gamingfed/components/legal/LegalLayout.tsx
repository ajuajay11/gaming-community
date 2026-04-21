import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export async function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  const t = await getTranslations("legal");

  return (
    <main className="container mx-auto px-5 py-10 md:py-16 max-w-3xl text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        {t("backToHome")}
      </Link>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-gray-400">{subtitle}</p>}
      {lastUpdated && (
        <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">
          {t("lastUpdated")} {lastUpdated}
        </p>
      )}
      <div className="mt-8 space-y-8 text-sm md:text-base leading-relaxed text-gray-200">
        {children}
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg md:text-xl font-semibold text-white">{heading}</h2>
      <div className="mt-2 space-y-3 text-gray-300">{children}</div>
    </section>
  );
}
