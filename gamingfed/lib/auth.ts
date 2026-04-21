import "server-only";
import { apiFetchWithCookieSync } from "@/lib/api/server";
import type { UserSummary } from "@/services/types";

/**
 * Fetches the authenticated user server-side. Returns null when the request
 * is unauthenticated or the backend is unreachable — never throws so pages
 * can render a signed-out state gracefully.
 *
 * Uses {@link apiFetchWithCookieSync} so a 401 (e.g. session replaced by a
 * newer login) applies `Set-Cookie` clears from the API to the browser.
 */
export async function getCurrentUser(): Promise<UserSummary | null> {
  try {
    const { user } = await apiFetchWithCookieSync<{ user: UserSummary }>("/auth/me");
    return user ?? null;
  } catch {
    return null;
  }
}
