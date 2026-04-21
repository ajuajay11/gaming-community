"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/**
 * When the API returns 401 (e.g. session invalidated by login elsewhere),
 * `apiFetch` dispatches this event so we refresh RSC tree and drop stale user state.
 */
export function SessionSync() {
  const router = useRouter();

  useEffect(() => {
    const onUnauthorized = () => router.refresh();
    window.addEventListener("kerala-hub:unauthorized", onUnauthorized);
    return () => window.removeEventListener("kerala-hub:unauthorized", onUnauthorized);
  }, [router]);

  return null;
}
