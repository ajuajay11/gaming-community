import { Link } from "@/i18n/navigation";
import {
  Bell,
  Compass,
  Gamepad2,
  Hourglass,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { gameService } from "@/services/game.service";
import { buildWhatsAppHref, formatPrice, maskContact } from "@/lib/format";
import { KYC } from "@/lib/status";
import type { ListingDoc, ListingSeller } from "@/services/types";

export const metadata = {
  title: "Messages — Kerala Hub",
  description:
    "Chat with buyers and sellers on Kerala Hub. In-app messaging is rolling out soon.",
};

const SUPPORT_WHATSAPP = "+919884259035";
const SUPPORT_EMAIL = "support@keralahub.gg";

/**
 * Inbox shell. In-app chat is not wired to a backend yet, so this page is
 * deliberately honest: it explains what's coming, surfaces support channels
 * the user can use today, and keeps the UI visually in line with the rest of
 * the app so the tab stops 404-ing.
 */
interface ChatPageProps {
  searchParams: Promise<{ listing?: string; seller?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { listing: listingId, seller: sellerId } = await searchParams;
  const nextQs = new URLSearchParams();
  if (listingId) nextQs.set("listing", listingId);
  if (sellerId) nextQs.set("seller", sellerId);
  const nextPath = `/chat${nextQs.toString() ? `?${nextQs.toString()}` : ""}`;
  const user = await requireUser(nextPath);
  const viewerKycApproved = Number(user.kycStatus) === KYC.APPROVED;

  // When the user arrives from a listing's "Chat with seller" button, fetch
  // that listing so we can show real context until real-time chat ships.
  let listing: ListingDoc | null = null;
  if (listingId) {
    try {
      const res = await gameService.getGame(listingId);
      listing = res.game;
    } catch {
      listing = null;
    }
  }

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
            <MessageSquare className="h-6 w-6 text-cyan-300" />
            Messages
          </h1>
          <p className="text-sm text-gray-400">
            Buyer ↔ seller conversations, all in one place.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
          <Hourglass className="h-3 w-3" /> Beta soon
        </span>
      </header>

      {listing && (
        <ListingContextCard listing={listing} viewerKycApproved={viewerKycApproved} />
      )}

      <section className="mt-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-white/[0.02] to-cyan-700/12 p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-200">
              <Sparkles className="h-3 w-3" /> Coming next
            </span>
            <h2 className="mt-3 text-xl font-extrabold md:text-2xl">
              Real-time chat, escrow handovers, and deal receipts.
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              We&apos;re building encrypted 1:1 chat so you can negotiate, send IDs and
              release escrow without ever leaving Kerala Hub. Until then, reach
              sellers via the contact details shown on each listing.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-3 text-sm font-bold text-black"
            >
              <Compass className="h-4 w-4" />
              Browse listings
            </Link>
            <Link
              href="/sell/manage"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20"
            >
              My listings
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <Perk
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Verified-only threads"
          copy="Messages open only after both sides clear KYC."
        />
        <Perk
          icon={<Bell className="h-5 w-5" />}
          title="Push & email alerts"
          copy="Never miss a buyer, even when the app is closed."
        />
        <Perk
          icon={<LifeBuoy className="h-5 w-5" />}
          title="Dispute support"
          copy="A moderator can join any chat to resolve issues fast."
        />
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Inbox
        </h3>

        <ul className="mt-4 space-y-2">
          <EmptyRow
            title="No conversations yet"
            copy="When in-app chat launches, your active deals will appear here."
          />
          <SupportRow email={SUPPORT_EMAIL} phone={SUPPORT_WHATSAPP} />
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
        <p className="text-sm text-gray-300">
          Need to talk to a seller right now?
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Open any listing — seller email, phone, and WhatsApp appear after{" "}
          <Link href="/kyc" className="text-cyan-300 hover:underline">
            KYC verification
          </Link>{" "}
          is approved. You&apos;re signed in; finish KYC if you still see masked
          contacts.
        </p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
        >
          <Compass className="h-3.5 w-3.5" /> Explore listings
        </Link>
      </section>
    </main>
  );
}

function Perk({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
        {icon}
      </div>
      <h4 className="mt-3 text-sm font-bold">{title}</h4>
      <p className="mt-1 text-xs text-gray-400">{copy}</p>
    </div>
  );
}

function EmptyRow({ title, copy }: { title: string; copy: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-400">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-400">{copy}</p>
      </div>
    </li>
  );
}

function SupportRow({ email, phone }: { email: string; phone: string }) {
  // `wa.me` expects the number without the leading "+".
  const waNumber = phone.replace(/[^0-9]/g, "");
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Kerala Hub Support</p>
          <p className="text-xs text-gray-400">
            Trading issue? KYC stuck? Ping us — we reply within a few hours.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
        >
          <Phone className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
      </div>
    </li>
  );
}

/**
 * Renders when the user lands on `/chat` with a `?listing=…` query. It keeps
 * the seller's reach-out channels one click away so the user can contact
 * them while real-time chat is still in beta.
 */
function ListingContextCard({
  listing,
  viewerKycApproved,
}: {
  listing: ListingDoc;
  viewerKycApproved: boolean;
}) {
  const seller =
    listing.seller && typeof listing.seller === "object"
      ? (listing.seller as ListingSeller)
      : null;
  const email = seller?.email ?? "";
  const phone = seller?.phone ?? "";
  const waHref =
    viewerKycApproved && seller
      ? buildWhatsAppHref(
          seller.whatsapp || seller.phone,
          `Hi! I'm interested in your listing "${listing.title}" on Kerala Hub.`,
        )
      : null;
  const hasContact = viewerKycApproved && Boolean(email || phone || waHref);

  return (
    <section className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4 md:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
          <Gamepad2 className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-cyan-200">
            Conversation about
          </p>
          <Link
            href={`/listing/${listing._id}`}
            className="mt-1 block truncate text-base font-bold text-white hover:underline"
          >
            {listing.title}
          </Link>
          <p className="mt-0.5 text-xs text-gray-400">
            {listing.game.name} · {listing.game.category} ·{" "}
            {formatPrice(listing.price.amount, listing.price.currency, {
              short: true,
            })}
          </p>

          {hasContact ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
                >
                  <Phone className="h-3.5 w-3.5" /> WhatsApp seller
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(
                    `Kerala Hub — ${listing.title}`,
                  )}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <Mail className="h-3.5 w-3.5" /> Email seller
                </a>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-gray-400">
                In-app chat arriving soon
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-400">
              {seller?.contactRequiresKyc || !viewerKycApproved ? (
                <>
                  Complete{" "}
                  <Link href="/kyc" className="text-cyan-300 hover:underline">
                    KYC verification
                  </Link>{" "}
                  to see this seller&apos;s email, phone, and WhatsApp.
                </>
              ) : (
                <>Seller contact: {maskContact(email || phone || seller?.whatsapp)}</>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
