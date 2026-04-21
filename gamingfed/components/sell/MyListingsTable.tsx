"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import type { ListingDoc } from "@/services/types";
import { gameService } from "@/services/game.service";
import { formatPrice, getListingImageUrl } from "@/lib/format";
import { ApiError } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface DeleteTarget {
  id: string;
  title: string;
}

export function MyListingsTable({ listings }: { listings: ListingDoc[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (listings.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
        <p className="text-sm text-gray-400">No listings here yet.</p>
        <Link
          href="/sell/new"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-bold text-black"
        >
          Create a listing
        </Link>
      </div>
    );
  }

  const askDelete = (id: string, title: string) => {
    setError(null);
    setTarget({ id, title });
  };

  const confirmDelete = () => {
    if (!target) return;
    start(async () => {
      try {
        await gameService.deleteGame(target.id);
        setTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not delete.");
        setTarget(null);
      }
    });
  };

  return (
    <div className="mt-6">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
      <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {listings.map((l) => {
          const img = getListingImageUrl(l.images?.[0] ?? null);
          const isDeleting = target?.id === l._id && pending;
          return (
            <li
              key={l._id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4"
            >
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-black/40">
                {img ? (
                  <Image src={img} alt={l.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    No photo
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">{l.title}</h3>
                  <StatusPill status={l.status} />
                </div>
                <p className="text-[11px] text-gray-500">
                  {l.game.name} · {l.game.category}
                  {typeof l.views === "number" && (
                    <span className="ml-2 inline-flex items-center gap-1 text-gray-400">
                      <Eye className="h-3 w-3" /> {l.views}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm font-bold text-cyan-300">
                  {formatPrice(l.price.amount, l.price.currency)}
                  {l.price.negotiable && (
                    <span className="ml-2 text-[10px] font-semibold text-emerald-300">
                      negotiable
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <Link
                  href={`/listing/${l._id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </Link>
                <Link
                  href={`/sell/manage/${l._id}/edit`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => askDelete(l._id, l.title)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/25 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this listing?"
        description={
          target ? (
            <>
              <span className="font-semibold text-white">
                &ldquo;{target.title}&rdquo;
              </span>{" "}
              will be removed permanently, along with its photos. This
              can&rsquo;t be undone.
            </>
          ) : null
        }
        confirmLabel="Delete listing"
        cancelLabel="Keep it"
        variant="danger"
        pending={pending}
        onConfirm={confirmDelete}
        onClose={() => !pending && setTarget(null)}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-cyan-500/15 text-cyan-300",
    sold: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amber-500/15 text-amber-300",
    removed: "bg-white/10 text-gray-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        map[status] ?? "bg-white/10"
      }`}
    >
      {status}
    </span>
  );
}
