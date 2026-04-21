import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Gamepad2 } from "lucide-react";
import type { GameCatalogEntry } from "@/services/types";
import { getListingImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CatalogCardProps {
  entry: GameCatalogEntry;
  className?: string;
}

/**
 * Compact card for a single game in the catalog / trending lists. Links to
 * the game-specific listings page.
 */
export function CatalogCard({ entry, className }: CatalogCardProps) {
  const imgUrl = getListingImageUrl(entry.sampleImage ?? null);
  const slug = encodeURIComponent(entry.name);
  return (
    <Link
      href={`/explore/${slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10",
        "hover:border-cyan-400/50 transition-colors",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full bg-black/40">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={entry.name}
            fill
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <Gamepad2 className="w-10 h-10" aria-hidden />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
          <h3 className="font-extrabold uppercase tracking-wider text-sm leading-tight line-clamp-2">
            {entry.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-cyan-300/80">
            {entry.listingsCount} listing{entry.listingsCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </Link>
  );
}
