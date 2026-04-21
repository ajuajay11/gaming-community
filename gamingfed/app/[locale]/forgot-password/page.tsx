import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirectLocal } from "@/lib/i18n-redirect";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgot" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) return redirectLocal("/");
  return (
    <main className="container mx-auto px-4 pt-10 pb-28 min-h-[70vh] flex items-center">
      <ForgotPasswordForm />
    </main>
  );
}
