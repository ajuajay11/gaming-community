import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Eye, Gamepad2 } from "lucide-react";
import type { ListingDoc } from "@/services/types";
import { getListingImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PriceTag } from "./PriceTag";

export interface ListingCardProps {
  listing: ListingDoc;
  signedIn: boolean;
  className?: string;
}

/**
 * Card for a single account / skin / currency listing. Price is masked with
 * a lock + *** when the viewer isn't signed in.
 */
export function ListingCard({ listing, signedIn, className }: ListingCardProps) {
  const imgUrl = getListingImageUrl(listing.images?.[0] ?? null);
  return (
    <Link
      href={`/listing/${listing._id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10",
        "hover:border-cyan-400/50 transition-colors",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-black/40">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <Gamepad2 className="w-10 h-10" aria-hidden />
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider font-semibold bg-black/70 backdrop-blur px-2 py-0.5 rounded-full border border-white/10">
          {listing.game.category}
        </span>
        {listing.details?.platform && (
          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-semibold bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full border border-cyan-400/30">
            {listing.details.platform}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h4 className="text-sm font-semibold line-clamp-2 min-h-[2.5rem]">
          {listing.title}
        </h4>
        <div className="mt-1 flex items-center justify-between">
          <PriceTag
            amount={listing.price.amount}
            currency={listing.price.currency}
            signedIn={signedIn}
            short
            className="text-base text-cyan-300"
          />
          {typeof listing.views === "number" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <Eye className="w-3 h-3" aria-hidden />
              {listing.views}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
