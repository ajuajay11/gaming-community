import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoginPromptDialog } from "@/components/common/LoginPromptDialog";
import { SessionSync } from "@/components/common/SessionSync";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = siteUrl;
  return {
    metadataBase: new URL(base),
    title: {
      default: `${siteConfig.name} — Gaming Market`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: `${base}/en`,
        hi: `${base}/hi`,
        ml: `${base}/ml`,
        "x-default": `${base}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${base}/${locale}`,
      siteName: siteConfig.name,
      title: `${siteConfig.name} — Gaming Market`,
      description: siteConfig.description,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — Gaming Market`,
      description: siteConfig.description,
      creator: siteConfig.twitterHandle,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const user = await getCurrentUser();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <Script src="/theme-boot.js" strategy="beforeInteractive" />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider user={user}>
            <SmoothScroll>
              <SessionSync />
              <SiteHeader user={user} />
              {children}
              <SiteFooter />
              <BottomNav />
              <Suspense fallback={null}>
                <LoginPromptDialog />
              </Suspense>
            </SmoothScroll>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
