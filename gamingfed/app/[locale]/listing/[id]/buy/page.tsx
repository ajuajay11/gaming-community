import { redirectLocal } from "@/lib/i18n-redirect";

interface BuyRedirectProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy `/listing/:id/buy` URLs (and any stray bookmarks) land here. We no
 * longer run purchases through the platform — buyers reach out to sellers via
 * chat — so we simply funnel them into the context-aware chat for this
 * listing. The seller id is resolved server-side on `/chat` from the `listing`
 * query, so we don't need it here.
 */
export default async function BuyRedirectPage({ params }: BuyRedirectProps) {
  const { id } = await params;
  return redirectLocal(`/chat?listing=${encodeURIComponent(id)}`);
}
