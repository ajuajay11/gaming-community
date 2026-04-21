import { redirectLocal } from "@/lib/i18n-redirect";

/**
 * `/buy` is an alias for the public catalog. Keeping the route so existing
 * links (hero CTA, feature cards, etc.) don't 404.
 */
export default async function BuyPage() {
  return redirectLocal("/explore");
}
