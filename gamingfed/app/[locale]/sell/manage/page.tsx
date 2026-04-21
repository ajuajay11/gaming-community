import { Link } from "@/i18n/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { gameService } from "@/services/game.service";
import { MyListingsTable } from "@/components/sell/MyListingsTable";
import type { ListingStatus } from "@/services/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage listings — Kerala Hub",
};

const STATUSES: Array<{ value: ListingStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "removed", label: "Removed" },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ManageListingsPage({ searchParams }: PageProps) {
  await requireUser("/sell/manage");

  const { status } = await searchParams;
  const selected = STATUSES.find((s) => s.value === status)?.value ?? "all";

  const { games, total } = await gameService
    .getMyListings({
      status: selected === "all" ? undefined : (selected as ListingStatus),
      limit: 50,
    })
    .catch(() => ({ games: [], total: 0, page: 1, limit: 50 }));

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/sell"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to seller hub
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">My listings</h1>
          <p className="text-sm text-gray-400">
            {total} {total === 1 ? "listing" : "listings"}
          </p>
        </div>
        <Link
          href="/sell/new"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-bold text-black"
        >
          <Plus className="h-3.5 w-3.5" /> New listing
        </Link>
      </div>

      <nav className="mt-5 flex flex-wrap gap-1 overflow-x-auto">
        {STATUSES.map((s) => {
          const active = selected === s.value;
          return (
            <Link
              key={s.value}
              href={{
                pathname: "/sell/manage",
                query: s.value === "all" ? {} : { status: s.value },
              }}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-cyan-400 bg-cyan-400 text-black"
                  : "border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/5"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      <MyListingsTable listings={games} />
    </main>
  );
}
