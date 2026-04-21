import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Compass, Flame, Gamepad2, Package } from "lucide-react";
import { CatalogCard } from "@/components/listings/CatalogCard";
import { ListingCard } from "@/components/listings/ListingCard";
import { CatalogSearch } from "@/components/explore/CatalogSearch";
import { CategoryTabs } from "@/components/explore/CategoryTabs";
import { CATEGORY_TABS, type CategoryKey } from "@/components/explore/categories";
import { Section } from "@/components/common/Section";
import { gameService } from "@/services";
import { getCurrentUser } from "@/lib/auth";
import type {
  GameCatalogEntry,
  GameCategory,
  ListingDoc,
} from "@/services/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explore" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export const revalidate = 60;

const VALID_CATEGORIES: CategoryKey[] = CATEGORY_TABS.map((t) => t.key);

interface ExplorePageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { search, category } = await searchParams;
  const trimmedSearch = search?.trim() || undefined;

  const activeCategory = (
    VALID_CATEGORIES.includes(category as CategoryKey) ? category : "all"
  ) as CategoryKey;

  const [user, catalogRes, listingsRes, t, tc] = await Promise.all([
    getCurrentUser(),
    gameService.getCatalog({ limit: 20, search: trimmedSearch }).catch(() => ({
      games: [] as GameCatalogEntry[],
    })),
    gameService
      .getGames({
        status: "active",
        limit: 24,
        sort: "newest",
        search: trimmedSearch,
        gameCategory:
          activeCategory === "all"
            ? undefined
            : (activeCategory as GameCategory),
      })
      .catch(() => ({
        games: [] as ListingDoc[],
        total: 0,
        page: 1,
        limit: 24,
      })),
    getTranslations("explore"),
    getTranslations("explore.categories"),
  ]);

  const games = catalogRes.games;
  const listings = listingsRes.games;
  const signedIn = Boolean(user);

  const listingsSectionTitle =
    activeCategory === "all"
      ? t("mixedTitle")
      : `${tc(activeCategory)}${t("listingsTitleSuffix")}`;

  const listingsSectionDescription = trimmedSearch
    ? t("descSearch", { query: trimmedSearch })
    : t("descDefault");

  let listingsEmptyMain: string;
  if (trimmedSearch) {
    const where =
      activeCategory === "all"
        ? t("whereAnyCategory")
        : tc(activeCategory);
    listingsEmptyMain = t("emptyListingsQuery", {
      query: trimmedSearch,
      where,
    });
  } else if (activeCategory === "all") {
    listingsEmptyMain = t("emptyListingsNone");
  } else {
    listingsEmptyMain = t("emptyListingsCategory", {
      category: tc(activeCategory),
    });
  }

  const globalEmptyTitle = trimmedSearch
    ? t("emptyGlobalTitleQuery")
    : t("emptyGlobalTitle");
  const globalEmptyDesc = trimmedSearch
    ? t("emptyGlobalDescQuery", { query: trimmedSearch })
    : t("emptyGlobalDesc");

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <header className="mt-2 mb-6">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
          <Compass className="w-4 h-4" aria-hidden />
          <span className="uppercase tracking-[0.2em] text-xs font-semibold">
            {t("eyebrow")}
          </span>
        </div>
        <h1 className="mt-1">
          {t("titleBefore")}
          <span className="brand-text">{t("titleBrand")}</span>
        </h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-gray-300">
          {t("description")}
        </p>
      </header>

      <div className="mb-5 max-w-md">
        <CatalogSearch
          initialValue={search ?? ""}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {games.length > 0 && (
        <Section
          eyebrow={t("popularEyebrow")}
          eyebrowIcon={<Flame className="h-3.5 w-3.5" aria-hidden />}
          title={t("popularTitle")}
          description={t("popularDescription")}
          spacing="sm"
          action={
            <Link
              href="#all-listings"
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"
            >
              {t("skipToListings")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {games.map((g) => (
              <CatalogCard key={g.name} entry={g} />
            ))}
          </div>
        </Section>
      )}

      <Section
        id="all-listings"
        eyebrow={t("latestEyebrow")}
        eyebrowIcon={<Package className="h-3.5 w-3.5" aria-hidden />}
        title={listingsSectionTitle}
        description={listingsSectionDescription}
      >
        <div className="mb-5">
          <CategoryTabs />
        </div>

        {listings.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {listings.map((l) => (
              <ListingCard key={l._id} listing={l} signedIn={signedIn} />
            ))}
          </div>
        ) : (
          <ListingsEmptyState
            main={listingsEmptyMain}
            hint={t("emptyListingsHint")}
          />
        )}
      </Section>

      {games.length === 0 && listings.length === 0 && (
        <EmptyState title={globalEmptyTitle} description={globalEmptyDesc} />
      )}
    </main>
  );
}

function ListingsEmptyState({ main, hint }: { main: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
        <Package className="h-4 w-4 text-cyan-600 dark:text-cyan-300" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{main}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{hint}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-12 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
        <Gamepad2 className="w-5 h-5 text-cyan-600 dark:text-cyan-300" aria-hidden />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
