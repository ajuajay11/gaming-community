"use client";

import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, ImageUp, Loader2, X } from "lucide-react";
import {
  profileService,
  type UpdateProfileInput,
} from "@/services/profile.service";
import { ApiError } from "@/lib/api/types";
import { SELECT_OPTION_CLASS } from "@/lib/listingRegions";

export interface ProfileEditFormProps {
  initial: {
    displayName: string;
    username: string;
    bio: string;
    avatarUrl: string;
    locale: string;
    whatsapp: string;
  };
}

const USERNAME_RX = /^[a-z0-9_]{3,32}$/;

export function ProfileEditForm({ initial }: ProfileEditFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [locale, setLocale] = useState(initial.locale);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const u = URL.createObjectURL(avatarFile);
    setAvatarPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [avatarFile]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Username is optional; only validate when the user actually typed one.
    if (username && !USERNAME_RX.test(username)) {
      setError("Username must be 3–32 chars, lowercase letters, digits or _");
      return;
    }

    const payload: UpdateProfileInput = {};
    if (displayName !== initial.displayName) payload.displayName = displayName;
    if (username !== initial.username) payload.username = username;
    if (bio !== initial.bio) payload.bio = bio;
    if (!avatarFile && avatarUrl !== initial.avatarUrl) {
      payload.avatarUrl = avatarUrl;
    }
    if (locale !== initial.locale) payload.locale = locale;
    if (whatsapp !== initial.whatsapp) payload.whatsapp = whatsapp || null;

    if (Object.keys(payload).length === 0 && !avatarFile) {
      setSuccess("Nothing to update.");
      return;
    }

    start(async () => {
      try {
        if (avatarFile) {
          const { profile: p } = await profileService.uploadAvatar(avatarFile);
          if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
          setAvatarFile(null);
        }
        if (Object.keys(payload).length) {
          await profileService.updateProfile(payload);
        }
        setSuccess("Profile updated.");
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not update.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-2xl flex-col gap-4">
      <Field label="Display name">
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          placeholder="What should other gamers call you?"
        />
      </Field>

      <Field
        label="Username"
        hint="3–32 chars: a–z, 0–9, underscore. This is your public @handle."
      >
        <div className="flex items-center gap-1">
          <span className="text-gray-400">@</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="eg. pro_gamer_2026"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </Field>

      <Field
        label="Profile photo"
        hint="Upload a JPEG, PNG, or WebP (max ~5MB), or paste an image URL below."
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/15 bg-white/[0.04]">
            {avatarPreview ? (
              // Blob URLs are not supported by next/image in all configs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                No photo
              </div>
            )}
            {avatarFile ? (
              <button
                type="button"
                onClick={() => setAvatarFile(null)}
                className="absolute right-0 top-0 rounded-bl-lg bg-black/75 p-1 text-white hover:bg-red-600"
                aria-label="Clear selected photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-gray-200 hover:border-cyan-400/40">
            <ImageUp className="h-4 w-4" />
            Choose image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) setAvatarFile(f);
              }}
            />
          </label>
        </div>
      </Field>

      <Field label="Avatar URL" hint="Optional — only used if you do not upload a file above.">
        <input
          type="url"
          className="input"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          disabled={Boolean(avatarFile)}
        />
      </Field>

      <Field label="Bio" hint={`${bio.length}/500`}>
        <textarea
          className="input min-h-[120px]"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          placeholder="Tell buyers about your trading history, the games you main, response time…"
        />
      </Field>

      <Field label="Language">
        <select
          className="input"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="en" className={SELECT_OPTION_CLASS}>
            English
          </option>
          <option value="ml" className={SELECT_OPTION_CLASS}>
            Malayalam
          </option>
          <option value="hi" className={SELECT_OPTION_CLASS}>
            Hindi
          </option>
          <option value="ta" className={SELECT_OPTION_CLASS}>
            Tamil
          </option>
        </select>
      </Field>

      <Field
        label="WhatsApp (public)"
        hint="Shown on your listings to KYC-approved buyers. Use international format, e.g. +919884259035."
      >
        <input
          className="input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\s/g, ""))}
          placeholder="+919884259035"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> {success}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-6 py-2 text-sm font-bold text-black disabled:opacity-60"
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
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
    </label>
  );
}
