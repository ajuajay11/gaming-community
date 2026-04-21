import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";

/**
 * Served at `/robots.txt`. Bots are free to index public marketplace
 * content (home, explore, listings, legal pages) but we explicitly disallow:
 *
 *   - `/api/*`       — no business being indexed
 *   - Authenticated surfaces (profile, chat, kyc, sell dashboard, manage)
 *   - Auth entry points (login/register/forgot-password) — they're thin
 *     redirect targets with duplicate content and no SEO value.
 *   - The Next.js internals under `/_next/*`.
 */
function localized(paths: string[]): string[] {
  return routing.locales.flatMap((locale) =>
    paths.map((p) => `/${locale}${p}`),
  );
}

export default function robots(): MetadataRoute.Robots {
  const privateSurfaces = [
    "/profile",
    "/chat",
    "/kyc",
    "/sell",
    "/login",
    "/register",
    "/forgot-password",
  ];
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/_next/",
          ...localized(privateSurfaces),
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
