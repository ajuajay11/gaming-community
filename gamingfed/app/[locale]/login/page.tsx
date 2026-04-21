import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirectLocal } from "@/lib/i18n-redirect";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string; registered?: string }>;
}

function sanitizeNext(next?: string): string | undefined {
  if (!next) return undefined;
  if (!next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, registered } = await searchParams;
  const safeNext = sanitizeNext(next);
  const user = await getCurrentUser();
  if (user) return redirectLocal(safeNext ?? "/");

  const t = await getTranslations("auth.login");

  return (
    <main className="container mx-auto px-4 pt-10 pb-28 min-h-[70vh] flex items-center">
      <div className="w-full">
        {registered && (
          <div className="mx-auto mb-6 max-w-md rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {t("registeredBanner")}
          </div>
        )}
        <LoginForm next={safeNext} />
      </div>
    </main>
  );
}
