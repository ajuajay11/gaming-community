import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

/** Locale-aware server redirect (next-intl `redirect` requires an explicit locale outside request components). */
export async function redirectLocal(href: string): Promise<never> {
  const locale = await getLocale();
  return redirect({ href, locale });
}
