import { routing } from "@/i18n/routing";

/**
 * Prefixes a path with the active locale when it is not already localized.
 * Used for `?next=` return URLs so redirects stay within the same locale.
 */
export function withLocalePath(locale: string, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return `/${locale}`;
  }
  const first = path.split("/").filter(Boolean)[0];
  if (
    first &&
    routing.locales.includes(first as (typeof routing.locales)[number])
  ) {
    return path;
  }
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}
