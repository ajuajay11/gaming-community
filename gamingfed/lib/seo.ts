/**
 * Central place for site-wide SEO constants. Override `NEXT_PUBLIC_SITE_URL`
 * at deploy time (Vercel / Docker env / .env.local). Falls back to the dev
 * origin so builds and `next dev` both work without extra config.
 */
const RAW_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

/** Strip trailing slash so we can safely concat paths like `${siteUrl}/foo`. */
export const siteUrl = RAW_URL.replace(/\/+$/, "");

export const siteConfig = {
  name: "Kerala Hub",
  shortName: "Kerala Hub",
  description:
    "Buy & sell premium gaming IDs, skins, currencies and boosts on Kerala Hub — India's community-driven gaming marketplace.",
  url: siteUrl,
  ogImage: `${siteUrl}/og.png`,
  twitterHandle: "@keralahub",
  keywords: [
    "gaming IDs",
    "buy gaming accounts",
    "sell gaming accounts",
    "PUBG accounts",
    "BGMI accounts",
    "Free Fire accounts",
    "Valorant accounts",
    "GTA V accounts",
    "gaming marketplace India",
    "Kerala Hub",
  ],
} as const;
