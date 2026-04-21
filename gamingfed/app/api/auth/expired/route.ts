import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { withLocalePath } from "@/lib/i18n-path";

/**
 * Called by protected server components when they decide the visitor has no
 * valid session (usually because `/auth/me` returned 401 or the backend is
 * unreachable). We can't delete cookies from inside a server component
 * render, so we bounce through this route handler to:
 *
 *   1. Delete the client-side `auth=true` hint cookie.
 *   2. Delete the httpOnly `token` JWT cookie (defence in depth — backend
 *      also clears it on 401 now).
 *   3. Redirect to `/login`, preserving `?next=` so the user lands back on
 *      the page they were trying to reach after signing in again.
 *
 * Only relative same-origin `next` values are honoured; anything weird
 * (absolute URL, protocol-relative `//…`, off-origin) is silently dropped
 * to avoid open-redirect abuse.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  cookieStore.delete("token");

  const rawNext = req.nextUrl.searchParams.get("next");
  const safeNext =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : null;

  const localeFromPath = (path: string | null) => {
    if (!path) return routing.defaultLocale;
    const seg = path.split("/").filter(Boolean)[0];
    if (
      seg &&
      routing.locales.includes(seg as (typeof routing.locales)[number])
    ) {
      return seg;
    }
    return routing.defaultLocale;
  };

  const locale = localeFromPath(safeNext);
  const target = new URL(`/${locale}/login`, req.url);
  if (safeNext) {
    target.searchParams.set("next", withLocalePath(locale, safeNext));
  }

  return NextResponse.redirect(target);
}
