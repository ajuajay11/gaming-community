"use client";

import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Gamepad2,
  Globe2,
  ImagePlus,
  Loader2,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import type {
  GameCategory,
  GamePlatform,
  ListingDoc,
  ListingImage,
  ListingStatus,
} from "@/services/types";
import { gameService } from "@/services/game.service";
import { ApiError } from "@/lib/api/types";
import { getListingImageKey, getListingImageUrl } from "@/lib/format";
import { getListingRegionOptions, SELECT_OPTION_CLASS } from "@/lib/listingRegions";
import { GamePicker } from "./GamePicker";

const MAX_LISTING_IMAGES = 20;

const CATEGORIES: GameCategory[] = [
  "account",
  "skin",
  "currency",
  "item",
  "boosting",
];
const PLATFORMS: Array<{ value: GamePlatform; label: string; icon: typeof Monitor }> = [
  { value: "PC", label: "PC", icon: Monitor },
  { value: "PlayStation", label: "PlayStation", icon: Gamepad2 },
  { value: "Xbox", label: "Xbox", icon: Gamepad2 },
  { value: "Mobile", label: "Mobile", icon: Smartphone },
  { value: "Cross-platform", label: "Cross-play", icon: Globe2 },
];
const CURRENCIES = ["USD", "INR", "EUR", "GBP", "AED"];

// `sold` is intentionally excluded — purchase flow is the only way to set it.
const EDITABLE_STATUSES: ListingStatus[] = ["active", "pending", "removed"];

export function EditListingForm({ listing }: { listing: ListingDoc }) {
  const router = useRouter();
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description ?? "");
  const [gameName, setGameName] = useState(listing.game.name);
  const [gameCategory, setGameCategory] = useState<GameCategory>(
    listing.game.category,
  );
  const [priceAmount, setPriceAmount] = useState(String(listing.price.amount));
  const [currency, setCurrency] = useState(listing.price.currency || "INR");
  const [negotiable, setNegotiable] = useState(
    Boolean(listing.price.negotiable),
  );
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  const [platform, setPlatform] = useState<GamePlatform | "">(
    listing.details?.platform ?? "",
  );
  const [region, setRegion] = useState(listing.details?.region ?? "");
  const [rank, setRank] = useState(listing.details?.rank ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(() => new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const newFilePreviews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      for (const p of newFilePreviews) URL.revokeObjectURL(p.url);
    };
  }, [newFilePreviews]);

  const keptExistingCount = (listing.images ?? []).filter((img) => {
    const k = getListingImageKey(img);
    if (!k) return true;
    return !removedKeys.has(k);
  }).length;

  const totalAfterEdit = keptExistingCount + newFiles.length;

  const regionOptions = useMemo(() => getListingRegionOptions(region), [region]);

  const toggleRemoveExisting = (key: string) => {
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const removeNewAt = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onPickMoreMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    const room = Math.max(0, MAX_LISTING_IMAGES - keptExistingCount - newFiles.length);
    if (room <= 0) {
      setError(`You can have at most ${MAX_LISTING_IMAGES} images.`);
      return;
    }
    setError(null);
    setNewFiles((prev) => [...prev, ...picked.slice(0, room)]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const price = Number(priceAmount);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price.");
      return;
    }

    if (totalAfterEdit < 1) {
      setError("Keep at least one image, or add a new one before removing the rest.");
      return;
    }
    if (totalAfterEdit > MAX_LISTING_IMAGES) {
      setError(`Maximum ${MAX_LISTING_IMAGES} images per listing.`);
      return;
    }

    const details: Record<string, string | number> = {};
    if (platform) details.platform = platform;
    if (region) details.region = region;
    if (rank) details.rank = rank;

    start(async () => {
      try {
        await gameService.updateGame(
          listing._id,
          {
            title,
            description,
            gameName,
            gameCategory,
            priceAmount: price,
            currency,
            negotiable,
            status,
            details: Object.keys(details).length ? (details as never) : undefined,
          },
          {
            newFiles,
            removedKeys: [...removedKeys],
          },
        );
        setSuccess("Listing updated.");
        setNewFiles([]);
        setRemovedKeys(new Set());
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not update.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-3xl flex-col gap-5">
      <Section title="Basics">
        <Field label="Title">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Game">
            <GamePicker
              value={gameName}
              onChange={setGameName}
              required
            />
          </Field>
          <Field label="Category">
            <select
              className="input"
              value={gameCategory}
              onChange={(e) => setGameCategory(e.target.value as GameCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className={SELECT_OPTION_CLASS}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className="input min-h-[140px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </Field>
      </Section>

      <Section title="Pricing & status">
        <div className="grid gap-3 md:grid-cols-[1fr_120px_160px]">
          <Field label="Price">
            <input
              className="input"
              type="number"
              min={0}
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Currency">
            <select
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c} className={SELECT_OPTION_CLASS}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus)}
              disabled={listing.status === "sold"}
            >
              {EDITABLE_STATUSES.map((s) => (
                <option key={s} value={s} className={SELECT_OPTION_CLASS}>
                  {s}
                </option>
              ))}
              {listing.status === "sold" && (
                <option value="sold" className={SELECT_OPTION_CLASS}>
                  sold
                </option>
              )}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Price is negotiable
        </label>
      </Section>

      <Section title="Media">
        <p className="text-xs text-gray-500">
          Add or remove images (max {MAX_LISTING_IMAGES}). Images hosted only as a URL without storage metadata
          cannot be removed here — upload a replacement instead.
        </p>
        <div className="flex flex-wrap gap-3">
          {(listing.images ?? []).map((img: ListingImage, i: number) => {
            const url = getListingImageUrl(img);
            const key = getListingImageKey(img);
            const strike = key ? removedKeys.has(key) : false;
            if (!url) return null;
            return (
              <div
                key={`${url}-${i}`}
                className={`relative h-24 w-24 overflow-hidden rounded-xl border ${
                  strike ? "border-red-500/50 opacity-50" : "border-white/10"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                {key ? (
                  <button
                    type="button"
                    onClick={() => toggleRemoveExisting(key)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                    aria-label={strike ? "Undo remove" : "Remove image"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
          {newFilePreviews.map(({ file, url }, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-cyan-500/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                aria-label="Remove new upload"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {totalAfterEdit < MAX_LISTING_IMAGES ? (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-[10px] text-gray-400 hover:border-cyan-400/50 hover:text-cyan-200">
              <ImagePlus className="h-6 w-6" />
              Add
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo"
                multiple
                className="sr-only"
                onChange={onPickMoreMedia}
              />
            </label>
          ) : null}
        </div>
        <p className="text-[11px] text-gray-500">
          {totalAfterEdit} / {MAX_LISTING_IMAGES} images after save
        </p>
      </Section>

      <Section title="Platform & details">
        <Field label="Platform">
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ value, label, icon: Icon }) => {
              const active = platform === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlatform(active ? "" : value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Region (optional)">
            <select
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {regionOptions.map((o) => (
                <option key={o.value || "__empty"} value={o.value} className={SELECT_OPTION_CLASS}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rank (optional)">
            <input
              className="input"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="Immortal 2, Diamond…"
              maxLength={128}
            />
          </Field>
        </div>
      </Section>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> {success}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Save changes
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          color: inherit;
          outline: none;
        }
        .input:focus {
          border-color: rgba(34, 211, 238, 0.6);
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}
