import "server-only";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { withLocalePath } from "@/lib/i18n-path";
import type { UserSummary } from "@/services/types";

/**
 * Server-component auth guard.
 *
 * Use at the top of any protected page:
 *
 *   const user = await requireUser("/sell");
 *
 * If the visitor has a valid session it returns the `UserSummary`. If not,
 * it throws the Next.js `redirect` to `/api/auth/expired?next=<pathname>`,
 * which wipes stale cookies before forwarding to `/login?next=…`.
 *
 * This prevents the "zombie session" loop where a lingering `auth=true`
 * hint cookie kept bouncing users between `/login` and the protected page.
 */
export async function requireUser(returnTo: string): Promise<UserSummary> {
  const user = await getCurrentUser();
  if (user) return user;

  const safePath =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";
  const locale = await getLocale();
  const localized = withLocalePath(locale, safePath);
  redirect(`/api/auth/expired?next=${encodeURIComponent(localized)}`);
}

/**
 * Variant for pages that want to *know* whether the visitor is signed in
 * (e.g. to switch UI) without redirecting. Returns `null` when unauth'd.
 */
export async function optionalUser(): Promise<UserSummary | null> {
  return getCurrentUser();
}
