import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { GAME_CATALOG } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";
import { gameService } from "@/services/game.service";
import type { ListingDoc } from "@/services/types";

/**
 * Cache the sitemap for 1 hour. Listings on a marketplace churn, so this
 * keeps search engines reasonably fresh without hammering the API on every
 * crawler hit.
 */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/**
 * Served at `/sitemap.xml`. Structure:
 *   1. Evergreen static pages (home, explore, legal, auth).
 *   2. Per-game "category" pages from the frontend catalog — these render
 *      even without backend data and are stable URLs.
 *   3. Live public listings — fetched with a high `limit` and only the
 *      `active` status so we don't leak sold/pending/removed items.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/explore",
    "/buy",
    "/terms",
    "/privacy",
    "/faq",
  ] as const;

  const staticMeta: Record<
    (typeof staticPaths)[number],
    { changeFrequency: Entry["changeFrequency"]; priority: number }
  > = {
    "": { changeFrequency: "daily", priority: 1 },
    "/explore": { changeFrequency: "hourly", priority: 0.9 },
    "/buy": { changeFrequency: "hourly", priority: 0.9 },
    "/terms": { changeFrequency: "yearly", priority: 0.3 },
    "/privacy": { changeFrequency: "yearly", priority: 0.3 },
    "/faq": { changeFrequency: "monthly", priority: 0.4 },
  };

  const staticEntries: Entry[] = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => {
      const meta = staticMeta[path];
      return {
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: meta.changeFrequency,
        priority: meta.priority,
      };
    }),
  );

  const catalogEntries: Entry[] = routing.locales.flatMap((locale) =>
    GAME_CATALOG.map((g) => ({
      url: `${siteUrl}/${locale}/explore/${encodeURIComponent(g.name)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  );

  const listingEntries: Entry[] = await fetchListingEntries();

  return [...staticEntries, ...catalogEntries, ...listingEntries];
}

/**
 * Pulls all active listings out of the API. Kept isolated so a backend blip
 * during crawl doesn't break sitemap generation — we just fall back to the
 * static + catalog entries.
 */
async function fetchListingEntries(): Promise<Entry[]> {
  try {
    const { games } = await gameService.getGames({
      status: "active",
      limit: 500,
      sort: "newest",
    });
    return (games ?? []).flatMap((listing: ListingDoc) =>
      routing.locales.map((locale) => ({
        url: `${siteUrl}/${locale}/listing/${listing._id}`,
        lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
    );
  } catch (err) {
    console.error("[sitemap] failed to fetch listings:", err);
    return [];
  }
}
