import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  Heart,
  Lock,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { AuthGate } from "@/components/common/AuthGate";
import { ListingImageGallery } from "./ListingImageGallery";
import { PriceTag } from "./PriceTag";
import { WhatsAppListingCta } from "./WhatsAppListingCta";
import { getListingImageUrl, maskContact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListingDoc, ListingSeller } from "@/services/types";

export interface ListingDetailViewProps {
  listing: ListingDoc;
  signedIn: boolean;
  viewerKycApproved: boolean;
  seller: ListingSeller | null;
  canRevealContact: boolean;
  isOwner: boolean;
  isSold: boolean;
  chatHref: string;
  whatsAppHref: string | null;
}

export function ListingDetailView({
  listing,
  signedIn,
  viewerKycApproved,
  seller,
  canRevealContact,
  isOwner,
  isSold,
  chatHref,
  whatsAppHref,
}: ListingDetailViewProps) {
  const images = (listing.images ?? []).map(getListingImageUrl).filter(Boolean) as string[];

  return (
    <main className="container mx-auto max-w-full min-w-0 overflow-x-hidden px-3 pt-4 pb-28 sm:px-4">
      <Link
        href={`/explore/${encodeURIComponent(listing.game.name)}`}
        className="mt-2 inline-flex max-w-full min-w-0 items-center gap-1 break-words text-xs text-app-fg-muted [overflow-wrap:anywhere] hover:text-app-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="min-w-0">Back to {listing.game.name}</span>
      </Link>

      <div className="mt-4 grid min-w-0 gap-6 md:grid-cols-5">
        <section className="min-w-0 md:col-span-3">
          <ListingImageGallery images={images} alt={listing.title}>
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
                aria-hidden
              />
              <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2">
                <ListingBadge>{listing.game.category}</ListingBadge>
                {listing.details?.platform && (
                  <ListingBadge tone="cyan">{listing.details.platform}</ListingBadge>
                )}
                {listing.isFeatured && (
                  <ListingBadge tone="amber">
                    <Star className="h-3 w-3" aria-hidden /> Featured
                  </ListingBadge>
                )}
              </div>
            </>
          </ListingImageGallery>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 md:col-span-2">
          <div className="min-w-0 rounded-2xl border border-app-border bg-app-card p-4 sm:p-5 shadow-sm dark:shadow-none">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-700 break-words dark:text-cyan-300 [overflow-wrap:anywhere] [font-size:clamp(0.65rem,2.5vw,0.7rem)]">
              {listing.game.name}
            </p>
            <h1 className="mt-1 max-w-full font-extrabold leading-snug break-words text-balance text-app-fg [overflow-wrap:anywhere] [font-size:clamp(1.125rem,4.2vw+0.35rem,1.75rem)] [line-height:1.2]">
              {listing.title}
            </h1>
            <div className="mt-4 flex min-w-0 flex-wrap items-end gap-x-3 gap-y-1">
              <span className="min-w-0">
                <PriceTag
                  amount={listing.price.amount}
                  currency={listing.price.currency}
                  signedIn={signedIn}
                  className="block max-w-full break-words text-cyan-600 [font-size:clamp(1.5rem,6vw+0.5rem,2.25rem)] dark:text-cyan-300"
                />
              </span>
              {listing.price.negotiable && signedIn && (
                <span className="pb-0.5 text-[11px] uppercase tracking-wider text-app-fg-muted">
                  Negotiable
                </span>
              )}
            </div>
            {!signedIn && (
              <p className="mt-2 text-xs text-app-fg-muted">
                Sign in to see the price and seller contact.
              </p>
            )}
            <div className="mt-5 grid grid-cols-1 gap-2">
              {isOwner ? (
                <ListingOwnerActions listingId={listing._id} />
              ) : isSold ? (
                <div className="rounded-xl border border-app-border bg-app-card-muted py-3 text-center text-sm text-app-fg-muted">
                  This listing has been sold.
                </div>
              ) : (
                <ListingBuyerActions chatHref={chatHref} whatsAppHref={whatsAppHref} />
              )}
              <p className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] leading-snug text-app-fg-subtle">
                <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden />
                <span className="min-w-0 max-w-md [overflow-wrap:anywhere]">
                  Kerala Hub connects buyers & sellers — handover happens off-platform.
                </span>
              </p>
            </div>
          </div>

          <ListingNetworkCard
            seller={seller}
            signedIn={signedIn}
            viewerKycApproved={viewerKycApproved}
            canRevealContact={canRevealContact}
          />

          {listing.description && (
            <div className="rounded-2xl border border-app-border bg-app-card-muted p-5 shadow-sm dark:shadow-none">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-app-fg-secondary">
                Description
              </h2>
              <p className="mt-2 max-w-full text-sm leading-relaxed break-words whitespace-pre-line text-app-fg-secondary [overflow-wrap:anywhere]">
                {listing.description}
              </p>
            </div>
          )}

          <ListingDetailsCard listing={listing} />
        </aside>
      </div>
    </main>
  );
}

/**
 * Buyers don't actually purchase through the platform — the value Kerala Hub
 * provides is the connection. Both CTAs funnel into the chat with the
 * listing + seller ID preserved, so future real-time chat can pick the
 * correct conversation up.
 */
function ListingBuyerActions({
  chatHref,
  whatsAppHref,
}: {
  chatHref: string;
  whatsAppHref: string | null;
}) {
  return (
    <>
      <AuthGate
        href={chatHref}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 py-3 text-sm font-bold text-black transition hover:opacity-90"
        promptMessage="Sign in to contact the seller."
      >
        <MessageSquare className="h-4 w-4" aria-hidden />
        Chat with seller
      </AuthGate>
      <WhatsAppListingCta href={whatsAppHref} />
      <AuthGate
        href={chatHref}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-app-border bg-app-card-muted py-2.5 text-xs font-semibold text-app-fg transition hover:bg-slate-100 dark:hover:bg-white/10"
        promptMessage="Sign in to let the seller know you're interested."
      >
        <Heart className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" aria-hidden />
        I&apos;m interested
      </AuthGate>
    </>
  );
}

function ListingOwnerActions({ listingId }: { listingId: string }) {
  return (
    <>
      <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-900 dark:border-amber-400/30 dark:text-amber-200">
        This is your listing — buyers will see a “Chat with seller” button here.
      </div>
      <Link
        href={`/sell/manage/${listingId}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 py-3 text-sm font-bold text-black transition hover:opacity-90"
      >
        <Pencil className="h-4 w-4" aria-hidden />
        Edit listing
      </Link>
      <Link
        href="/sell/manage"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-app-border bg-app-card-muted py-2.5 text-xs font-semibold text-app-fg transition hover:bg-slate-100 dark:hover:bg-white/10"
      >
        Manage all listings
      </Link>
    </>
  );
}

function ListingBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "cyan" | "amber";
}) {
  const tones: Record<string, string> = {
    default: "bg-black/70 text-white border-white/10",
    cyan: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
    amber: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur break-words [overflow-wrap:anywhere]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function ListingNetworkCard({
  seller,
  signedIn,
  viewerKycApproved,
  canRevealContact,
}: {
  seller: ListingSeller | null;
  signedIn: boolean;
  viewerKycApproved: boolean;
  canRevealContact: boolean;
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-card-muted p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-app-fg-secondary">
          Seller network
        </h2>
        {!signedIn ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-app-fg-muted">
            <Lock className="h-3 w-3" aria-hidden />
            Locked
          </span>
        ) : !viewerKycApproved ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-amber-300">
            <Lock className="h-3 w-3" aria-hidden />
            KYC required
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-emerald-400">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Unlocked
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <ListingNetworkRow
          icon={<Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-300" aria-hidden />}
          label="Email"
          value={
            canRevealContact ? seller?.email ?? "Not provided" : maskContact(seller?.email)
          }
          masked={!canRevealContact}
        />
        <ListingNetworkRow
          icon={<Phone className="h-4 w-4 text-cyan-600 dark:text-cyan-300" aria-hidden />}
          label="Phone"
          value={
            canRevealContact ? seller?.phone ?? "Not provided" : maskContact(seller?.phone)
          }
          masked={!canRevealContact}
        />
        <ListingNetworkRow
          icon={<MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />}
          label="WhatsApp"
          value={
            canRevealContact
              ? seller?.whatsapp || seller?.phone || "Not set"
              : maskContact(seller?.whatsapp || seller?.phone)
          }
          masked={!canRevealContact}
        />
      </dl>
      {!signedIn && (
        <p className="mt-3 text-xs text-app-fg-muted">
          Sign in to reveal contact details and message the seller.
        </p>
      )}
      {signedIn && !viewerKycApproved && (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200/90">
          Complete KYC verification to view seller email, phone, and WhatsApp.
        </p>
      )}
    </div>
  );
}

function ListingNetworkRow({
  icon,
  label,
  value,
  masked,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  masked: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <dt className="inline-flex shrink-0 items-center gap-2 text-app-fg-muted">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 max-w-[min(100%,16rem)] text-right font-mono text-sm break-words sm:max-w-[55%]",
          masked ? "tracking-widest text-app-fg-subtle" : "text-app-fg",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ListingDetailsCard({ listing }: { listing: ListingDoc }) {
  const rows: Array<[string, string | number | undefined]> = [
    ["Platform", listing.details?.platform],
    ["Region", listing.details?.region],
    ["Level", listing.details?.level],
    ["Rank", listing.details?.rank],
    ["Hours played", listing.details?.hoursPlayed],
    ["Currency", listing.price.currency],
    ["Listed", listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : undefined],
  ].filter(([, v]) => v !== undefined && v !== "") as Array<[string, string | number]>;

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-app-border bg-app-card-muted p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-app-fg-secondary">
          Details
        </h2>
        {typeof listing.views === "number" && (
          <span className="inline-flex items-center gap-1 text-[11px] text-app-fg-muted">
            <Eye className="h-3 w-3" aria-hidden />
            {listing.views} views
          </span>
        )}
      </div>
      <dl className="mt-3 grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="min-w-0 text-app-fg-muted">{k}</dt>
            <dd className="min-w-0 text-right break-words text-app-fg [overflow-wrap:anywhere]">
              {String(v)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
