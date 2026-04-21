import type { ListingImage } from "@/services/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "AED",
};

export function formatPrice(
  amount: number,
  currency: string = "USD",
  { short = false }: { short?: boolean } = {},
): string {
  const symbol = CURRENCY_SYMBOLS[currency?.toUpperCase?.()] ?? `${currency} `;
  const value = short
    ? formatCompact(amount)
    : new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(amount);
  return `${symbol}${value}`;
}

function formatCompact(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Resolves the listing image URL from either new-style `{url, key}` or legacy string. */
export function getListingImageUrl(image: ListingImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url ?? null;
}

/** Blob storage key when present (used when removing images on edit). */
export function getListingImageKey(image: ListingImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "object" && image.key) return image.key;
  return null;
}

/** Masks a phone/email by preserving the first couple chars for recognition. */
export function maskContact(value?: string | null): string {
  if (!value) return "***";
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    const shown = name.slice(0, 2);
    return `${shown}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
  }
  const last4 = value.slice(-2);
  return `${"*".repeat(Math.max(4, value.length - 2))}${last4}`;
}

/** Digits only for https://wa.me/{digits} */
export function digitsForWhatsApp(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

export function buildWhatsAppHref(
  phoneOrWa: string | undefined | null,
  prefilledMessage?: string,
): string | null {
  const d = digitsForWhatsApp(phoneOrWa);
  if (!d) return null;
  const base = `https://wa.me/${d}`;
  if (prefilledMessage) {
    return `${base}?text=${encodeURIComponent(prefilledMessage)}`;
  }
  return base;
}
