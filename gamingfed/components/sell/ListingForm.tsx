"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Gamepad2,
  Globe2,
  ImagePlus,
  Loader2,
  Monitor,
  Smartphone,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { gameService } from "@/services/game.service";
import type { GameCategory, GamePlatform } from "@/services/types";
import { ApiError } from "@/lib/api/types";
import { LISTING_REGION_OPTIONS, SELECT_OPTION_CLASS } from "@/lib/listingRegions";
import { GamePicker } from "./GamePicker";

const CATEGORIES: Array<{ value: GameCategory; label: string; hint: string }> = [
  { value: "account", label: "Account", hint: "Full account handover" },
  { value: "skin", label: "Skins", hint: "Cosmetic bundle" },
  { value: "currency", label: "Currency", hint: "V-bucks, UC, coins…" },
  { value: "item", label: "Item", hint: "One-off in-game item" },
  { value: "boosting", label: "Boosting", hint: "Rank / level service" },
];

const PLATFORMS: Array<{ value: GamePlatform; label: string; icon: typeof Monitor }> = [
  { value: "PC", label: "PC", icon: Monitor },
  { value: "PlayStation", label: "PlayStation", icon: Gamepad2 },
  { value: "Xbox", label: "Xbox", icon: Gamepad2 },
  { value: "Mobile", label: "Mobile", icon: Smartphone },
  { value: "Cross-platform", label: "Cross-play", icon: Globe2 },
];

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "AED"];
const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface FormState {
  title: string;
  gameName: string;
  gameCategory: GameCategory;
  description: string;
  priceAmount: string;
  currency: string;
  negotiable: boolean;
  platform: GamePlatform | "";
  region: string;
  rank: string;
}

const INITIAL: FormState = {
  title: "",
  gameName: "",
  gameCategory: "account",
  description: "",
  priceAmount: "",
  currency: "INR",
  negotiable: false,
  platform: "",
  region: "",
  rank: "",
};

export function ListingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [media, setMedia] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const previews = useMemo(
    () => media.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [media],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const existing = media.length;
    const roomLeft = MAX_IMAGES - existing;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .filter((f) => f.size <= MAX_IMAGE_BYTES)
      .slice(0, roomLeft);
    if (!next.length) {
      setError("Add JPG/PNG images under 5 MB each.");
      return;
    }
    setMedia((prev) => [...prev, ...next]);
  };

  const removeFile = (idx: number) =>
    setMedia((prev) => prev.filter((_, i) => i !== idx));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError("Give your listing a title.");
    if (!form.gameName.trim()) return setError("Which game is this for?");
    const price = Number(form.priceAmount);
    if (!Number.isFinite(price) || price <= 0)
      return setError("Enter a valid price.");
    if (!media.length) return setError("Upload at least one photo.");

    const details: Record<string, string | number> = {};
    if (form.platform) details.platform = form.platform;
    if (form.region) details.region = form.region;
    if (form.rank) details.rank = form.rank;

    start(async () => {
      try {
        const { game } = await gameService.uploadGame({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          gameName: form.gameName.trim(),
          gameCategory: form.gameCategory,
          priceAmount: price,
          currency: form.currency,
          negotiable: form.negotiable,
          details: Object.keys(details).length ? (details as never) : undefined,
          media,
        });
        router.replace(`/listing/${game._id}?created=1`);
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not publish listing.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <Section title="Basics">
          <Field label="Listing title" hint={`${form.title.length}/100`}>
            <input
              className="input"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={100}
              placeholder="Valorant Immortal 2 · Full Skin Vault · EU"
              required
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Game">
              <GamePicker
                value={form.gameName}
                onChange={(v) => update("gameName", v)}
                placeholder="GTA V, PUBG, Free Fire…"
                required
              />
            </Field>
            <Field label="Category">
              <div className="grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => update("gameCategory", c.value)}
                    title={c.hint}
                    className={`rounded-lg py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                      form.gameCategory === c.value
                        ? "bg-cyan-400 text-black"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Description" hint={`${form.description.length}/2000`}>
            <textarea
              className="input min-h-[140px]"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={2000}
              placeholder="Rank, inventory highlights, how the handover works, anything buyers should know."
            />
          </Field>
        </Section>

        <Section title="Pricing">
          <div className="grid gap-3 md:grid-cols-[1fr_120px]">
            <Field label="Price">
              <input
                className="input"
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={form.priceAmount}
                onChange={(e) => update("priceAmount", e.target.value)}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Currency">
              <select
                className="input"
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className={SELECT_OPTION_CLASS}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => update("negotiable", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10"
            />
            Price is negotiable
          </label>
        </Section>

        <Section title="Platform & details">
          <Field label="Platform" hint="Tap again to clear. Leave empty if not applicable.">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ value, label, icon: Icon }) => {
                const active = form.platform === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("platform", active ? "" : value)}
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
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
              >
                {LISTING_REGION_OPTIONS.map((o) => (
                  <option key={o.value || "__empty"} value={o.value} className={SELECT_OPTION_CLASS}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rank (optional)">
              <input
                className="input"
                value={form.rank}
                onChange={(e) => update("rank", e.target.value)}
                placeholder="Immortal 2, Diamond…"
                maxLength={128}
              />
            </Field>
          </div>
        </Section>
      </div>

      <aside className="flex flex-col gap-5">
        <Section title={`Photos (${media.length}/${MAX_IMAGES})`}>
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center text-sm text-gray-400 hover:border-cyan-400/60 hover:text-white"
            htmlFor="media"
          >
            <ImagePlus className="h-6 w-6" />
            Click or drop JPG/PNG
            <span className="text-[11px] text-gray-500">Max 5 MB each, up to {MAX_IMAGES}</span>
            <input
              id="media"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>

          {previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((p, i) => (
                <li key={p.url} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  <Image
                    src={p.url}
                    alt={p.file.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-80 hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Preview">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-400">
              <Tag className="h-3 w-3" /> {form.gameCategory}
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">
              {form.title || "Your listing title"}
            </p>
            <p className="text-[11px] text-gray-500">
              {form.gameName || "Game name"}
            </p>
            <p className="mt-2 text-base font-bold text-cyan-300">
              {form.priceAmount
                ? `${form.currency} ${Number(form.priceAmount).toLocaleString()}`
                : "—"}
              {form.negotiable && (
                <span className="ml-2 text-[10px] font-semibold text-emerald-300">
                  negotiable
                </span>
              )}
            </p>
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

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Publish listing
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL);
              setMedia([]);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 px-5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear form
          </button>
        </div>
        <p className="flex items-center gap-1 text-[11px] text-gray-500">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> You can edit or remove
          the listing anytime from <span className="text-gray-300">Manage</span>.
        </p>
      </aside>

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
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
    </label>
  );
}
