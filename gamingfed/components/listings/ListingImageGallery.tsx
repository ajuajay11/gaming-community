"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SWIPE_PX = 48;

export interface ListingImageGalleryProps {
  images: string[];
  alt: string;
  /** Absolutely positioned content (e.g. gradient + badges) inside the hero frame. */
  children?: React.ReactNode;
}

export function ListingImageGallery({ images, alt, children }: ListingImageGalleryProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const hasImages = count > 0;
  const src = hasImages ? images[Math.min(active, count - 1)] : null;

  const go = useCallback(
    (delta: -1 | 1) => {
      if (!hasImages) return;
      setActive((i) => (i + delta + count) % count);
    },
    [count, hasImages],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx > 0) go(-1);
    else go(1);
  };

  return (
    <div className="min-w-0 space-y-3">
      <div
        className="relative aspect-[4/3] w-full max-w-full min-h-0 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {src ? (
          <Image
            key={`${src}-${active}`}
            src={src}
            alt={`${alt} — ${active + 1} of ${count}`}
            fill
            priority={active === 0}
            sizes="(min-width: 768px) 55vw, calc(100vw - 1.5rem)"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[12rem] w-full items-center justify-center text-white/30">
            <Gamepad2 className="h-16 w-16" aria-hidden />
          </div>
        )}

        {hasImages && count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 md:left-3"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 md:right-3"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
            <div
              className="pointer-events-none absolute bottom-14 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-white/90 backdrop-blur-sm"
              aria-live="polite"
            >
              {active + 1} / {count}
            </div>
          </>
        ) : null}

        {children}
      </div>

      {hasImages && count > 1 ? (
        <div
          className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory [scrollbar-width:thin] md:mx-0 md:px-0"
          role="tablist"
          aria-label="Listing images"
        >
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square h-20 w-20 shrink-0 snap-start overflow-hidden rounded-lg sm:h-24 sm:w-24",
                "border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                i === active
                  ? "border-cyan-400 opacity-100 ring-2 ring-cyan-400/40"
                  : "border-white/10 opacity-75 hover:opacity-100",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
