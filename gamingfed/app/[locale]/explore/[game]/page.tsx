import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listings/ListingCard";
import { CategoryTabs } from "@/components/explore/CategoryTabs";
import { getCurrentUser } from "@/lib/auth";
import { gameService } from "@/services";
import type {
  GameCategory,
  ListingDoc,
} from "@/services/types";

export const revalidate = 60;

const VALID_CATEGORIES: GameCategory[] = [
  "account",
  "skin",
  "currency",
  "item",
  "boosting",
];

interface GameListingsPageProps {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({
  params,
}: GameListingsPageProps): Promise<Metadata> {
  const { game } = await params;
  const name = decodeURIComponent(game);
  return {
    title: `${name} listings | Kerala Hub`,
    description: `Buy and sell ${name} accounts, skins, currency and more on Kerala Hub.`,
  };
}

export default async function GameListingsPage({
  params,
  searchParams,
}: GameListingsPageProps) {
  const { game } = await params;
  const gameName = decodeURIComponent(game);
  const { category } = await searchParams;

  const active: GameCategory | "all" =
    category && VALID_CATEGORIES.includes(category as GameCategory)
      ? (category as GameCategory)
      : "all";

  const user = await getCurrentUser();

  let listings: ListingDoc[] = [];
  let total = 0;
  try {
    const res = await gameService.getGames({
      gameName,
      gameCategory: active === "all" ? undefined : active,
      limit: 50,
      sort: "newest",
    });
    listings = res.games;
    total = res.total;
  } catch {
    listings = [];
  }

  if (!listings.length && active === "all") {
    // The game page is defined by its listings — if there are none, 404.
    try {
      const res = await gameService.getGames({ gameName, limit: 1 });
      if (!res.games.length) notFound();
    } catch {
      notFound();
    }
  }

  const availableCategories = Array.from(
    new Set(listings.map((l) => l.game.category)),
  );

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white mt-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
        Back to explore
      </Link>
      <header className="mt-3 mb-5">
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-wide">
          {gameName}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {total} listing{total === 1 ? "" : "s"} available
        </p>
      </header>

      <div className="mb-5">
        <CategoryTabs
          basePath={`/explore/${game}`}
          available={availableCategories}
        />
      </div>

      {listings.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} signedIn={Boolean(user)} />
          ))}
        </div>
      ) : (
        <div className="mt-12 mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <h2 className="text-base font-semibold">Nothing in this category yet</h2>
          <p className="mt-1 text-xs text-gray-400">
            Try a different category or check back soon.
          </p>
        </div>
      )}
    </main>
  );
}
