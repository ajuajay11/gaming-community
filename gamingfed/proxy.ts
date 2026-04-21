import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const AUTH_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("auth")?.value === "true";
}

function sanitizeNext(raw: string | null): string | undefined {
  if (!raw) return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

function stripLocalePrefix(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) {
      return pathname.slice(`/${loc}`.length) || "/";
    }
  }
  return pathname;
}

function localeFromPathname(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (
    seg &&
    routing.locales.includes(seg as (typeof routing.locales)[number])
  ) {
    return seg;
  }
  return routing.defaultLocale;
}

export function proxy(req: NextRequest) {
  const intlResponse = intlMiddleware(req);

  if (intlResponse.status >= 300) {
    return intlResponse;
  }

  const pathname = stripLocalePrefix(req.nextUrl.pathname);
  const isAuthOnly = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!isAuthOnly) return intlResponse;
  if (!isAuthenticated(req)) return intlResponse;

  const locale = localeFromPathname(req.nextUrl.pathname);
  const next = sanitizeNext(req.nextUrl.searchParams.get("next"));
  const target = req.nextUrl.clone();
  target.pathname = next ?? `/${locale}`;
  target.search = "";
  return NextResponse.redirect(target);
}

export const config = {
  matcher: [
    "/",
    "/(en|hi|ml)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
