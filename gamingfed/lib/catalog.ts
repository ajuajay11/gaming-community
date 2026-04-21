import type { GamePlatform } from "@/services/types";

/**
 * Static catalog of titles that sellers can list against, regardless of
 * what admin has seeded in the DB. Backend accepts any `gameName` string so
 * these flow through unchanged. `slug` is the canonical identifier used in
 * URLs and `/explore/[game]`; `name` is the display label.
 *
 * Keep this list curated — the sell form also allows a freeform "Other"
 * option for long-tail titles that aren't worth adding here.
 */
export interface GameCatalogItem {
  slug: string;
  name: string;
  platforms: GamePlatform[];
}

export const GAME_CATALOG: GameCatalogItem[] = [
  { slug: "gta-v", name: "GTA V", platforms: ["PC", "PlayStation", "Xbox"] },
  { slug: "pubg", name: "PUBG", platforms: ["PC", "Mobile", "PlayStation", "Xbox"] },
  { slug: "bgmi", name: "BGMI", platforms: ["Mobile"] },
  { slug: "free-fire", name: "Free Fire", platforms: ["Mobile"] },
  { slug: "valorant", name: "Valorant", platforms: ["PC"] },
  { slug: "call-of-duty-warzone", name: "Call of Duty: Warzone", platforms: ["PC", "PlayStation", "Xbox"] },
  { slug: "call-of-duty-mobile", name: "Call of Duty: Mobile", platforms: ["Mobile"] },
  { slug: "fortnite", name: "Fortnite", platforms: ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"] },
  { slug: "apex-legends", name: "Apex Legends", platforms: ["PC", "PlayStation", "Xbox", "Mobile"] },
  { slug: "minecraft", name: "Minecraft", platforms: ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"] },
  { slug: "fc-25", name: "EA SPORTS FC 25 (Football)", platforms: ["PC", "PlayStation", "Xbox"] },
  { slug: "efootball", name: "eFootball", platforms: ["PC", "PlayStation", "Xbox", "Mobile"] },
  { slug: "clash-of-clans", name: "Clash of Clans", platforms: ["Mobile"] },
  { slug: "clash-royale", name: "Clash Royale", platforms: ["Mobile"] },
  { slug: "league-of-legends", name: "League of Legends", platforms: ["PC"] },
  { slug: "dota-2", name: "Dota 2", platforms: ["PC"] },
  { slug: "csgo-cs2", name: "Counter-Strike 2", platforms: ["PC"] },
  { slug: "genshin-impact", name: "Genshin Impact", platforms: ["PC", "PlayStation", "Mobile"] },
  { slug: "roblox", name: "Roblox", platforms: ["PC", "Xbox", "Mobile"] },
  { slug: "red-dead-redemption-2", name: "Red Dead Redemption 2", platforms: ["PC", "PlayStation", "Xbox"] },
];

/** Lookup helpers — case-insensitive so search/filter tolerates user input. */
export function findCatalogBySlug(slug: string | undefined | null) {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  return GAME_CATALOG.find((g) => g.slug === s);
}

export function findCatalogByName(name: string | undefined | null) {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return GAME_CATALOG.find((g) => g.name.toLowerCase() === n);
}
