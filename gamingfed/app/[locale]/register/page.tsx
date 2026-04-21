import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirectLocal } from "@/lib/i18n-redirect";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>;
}

function sanitizeNext(next?: string): string | undefined {
  if (!next) return undefined;
  if (!next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const safeNext = sanitizeNext(next);
  const user = await getCurrentUser();
  if (user) return redirectLocal(safeNext ?? "/");

  return (
    <main className="container mx-auto px-4 pt-10 pb-28 min-h-[70vh] flex items-center">
      <div className="w-full">
        <RegisterForm next={safeNext} />
      </div>
    </main>
  );
}
