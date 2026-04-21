import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  UserCircle,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { profileService } from "@/services/profile.service";
import { gameService } from "@/services/game.service";
import type { ProfileMe } from "@/services/types";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { ListingCard } from "@/components/listings/ListingCard";
import { KYC, accountLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account — Kerala Hub",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function KycBadge({ status }: { status: ProfileMe["kycSummary"]["kycStatus"] }) {
  const s = Number(status);
  if (s === KYC.APPROVED) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
        <ShieldCheck className="h-3 w-3" /> KYC verified
      </span>
    );
  }
  if (s === KYC.PENDING) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
        <ShieldAlert className="h-3 w-3" /> KYC under review
      </span>
    );
  }
  if (s === KYC.REJECTED) {
    return (
      <Link
        href="/kyc"
        className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-300 hover:bg-red-500/25"
      >
        <ShieldAlert className="h-3 w-3" /> KYC rejected · resubmit
      </Link>
    );
  }
  return (
    <Link
      href="/kyc"
      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-gray-300 hover:bg-white/10"
    >
      <ShieldAlert className="h-3 w-3" /> Complete KYC
    </Link>
  );
}

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  // Both requests are gated by the cookie; any failure falls back to empty
  // state so a misbehaving endpoint doesn't take down the whole page.
  const [account, listings, purchases] = await Promise.all([
    profileService.getMyAccount().catch(() => null),
    gameService.getMyListings({ limit: 6 }).catch(() => ({ games: [], total: 0, page: 1, limit: 6 })),
    gameService.getMyPurchases({ limit: 3 }).catch(() => ({ games: [], total: 0, page: 1, limit: 3 })),
  ]);

  const displayName =
    account?.profile?.displayName ||
    account?.profile?.username ||
    account?.user.email?.split("@")[0] ||
    account?.user.phone ||
    "Gamer";

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-white/[0.02] to-cyan-700/12 p-5 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-cyan-400 md:h-20 md:w-20">
              {account?.profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.profile.avatarUrl}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-10 w-10 text-cyan-300" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold md:text-3xl">{displayName}</h1>
              <p className="text-xs text-gray-400 md:text-sm">
                {account?.profile?.username ? `@${account.profile.username}` : "Set a username to claim your handle"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-gray-200">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  {user.role}
                </span>
                <KycBadge status={account?.kycSummary?.kycStatus ?? 0} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
            >
              Edit profile
            </Link>
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<Store className="h-5 w-5" />}
          label="My listings"
          value={listings.total}
          href="/sell/manage"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Purchases"
          value={purchases.total}
          href="/profile/purchases"
        />
        <StatCard
          icon={<BadgeCheck className="h-5 w-5" />}
          label="Member since"
          value={formatDate(account?.user.createdAt).split(",")[0] ?? "—"}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Account status"
          value={accountLabel(account?.user.status ?? user.status)}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-300">
          Contact
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          <ContactRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={account?.user.email ?? "—"}
            verified={Boolean(account?.user.emailVerifiedAt)}
          />
          <ContactRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={account?.user.phone ?? "—"}
            verified={Boolean(account?.user.phoneVerifiedAt)}
          />
        </div>
      </section>

      {account?.profile?.bio && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-300">
            About
          </h2>
          <p className="text-sm text-gray-200 whitespace-pre-line">
            {account.profile.bio}
          </p>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
            Recent listings
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/sell/new"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-3 py-1 text-xs font-bold text-black"
            >
              + New listing
            </Link>
            <Link
              href="/sell/manage"
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
            >
              Manage all
            </Link>
          </div>
        </div>
        {listings.games.length === 0 ? (
          <EmptyState
            title="You haven't listed anything yet"
            cta={{ label: "Create your first listing", href: "/sell/new" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {listings.games.map((g) => (
              <ListingCard key={g._id} listing={g} signedIn />
            ))}
          </div>
        )}
      </section>

      {purchases.games.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-300">
            Recent purchases
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {purchases.games.map((g) => (
              <ListingCard key={g._id} listing={g} signedIn />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
}) {
  const body = (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 text-xl font-extrabold capitalize">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function ContactRow({
  icon,
  label,
  value,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">{icon}</span>
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      {value !== "—" && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            verified
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {verified ? "verified" : "unverified"}
        </span>
      )}
    </div>
  );
}

function EmptyState({
  title,
  cta,
}: {
  title: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
      <p className="text-sm text-gray-300">{title}</p>
      <Link
        href={cta.href}
        className="mt-3 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-bold text-black"
      >
        {cta.label}
      </Link>
    </div>
  );
}
