import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Hourglass,
  Plus,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { gameService } from "@/services/game.service";
import { profileService } from "@/services/profile.service";
import { formatPrice } from "@/lib/format";
import { KYC } from "@/lib/status";
import {
  Card,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sell your gaming ID — Kerala Hub",
  description:
    "List your gaming accounts, skins and in-game currency for sale. Verified buyers, instant transfers.",
};

export default async function SellLandingPage() {
  await requireUser("/sell");

  const [{ games, total }, account] = await Promise.all([
    gameService
      .getMyListings({ limit: 3 })
      .catch(() => ({ games: [], total: 0, page: 1, limit: 3 })),
    profileService.getMyAccount().catch(() => null),
  ]);

  const kycStatus = Number(account?.kycSummary?.kycStatus ?? KYC.NOT_SUBMITTED);
  const kycApproved = kycStatus === KYC.APPROVED;
  const activeCount = games.filter((g) => g.status === "active").length;
  const soldCount = games.filter((g) => g.status === "sold").length;

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-cyan-400/10 to-cyan-700/15 p-6 md:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-200">
            <Tag className="h-3 w-3" /> Seller hub
          </span>
          <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
            Turn your gaming IDs
            <br />
            into <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">instant cash</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-gray-300 md:text-base">
            List an account, skin bundle or in-game currency in under a minute.
            Verified buyers only, escrow on every transfer.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={kycApproved ? "/sell/new" : "/kyc"}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-5 py-3 text-sm font-bold text-black"
            >
              <Plus className="h-4 w-4" />
              {kycApproved ? "Create listing" : "Verify to list"}
            </Link>
            <Link
              href="/sell/manage"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20"
            >
              <Settings className="h-4 w-4" /> Manage listings
            </Link>
          </div>
        </div>
      </section>

      <KycBanner status={kycStatus} />

      <section className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat label="Total listings" value={total} />
        <MiniStat label="Active" value={activeCount} tone="cyan" />
        <MiniStat label="Sold" value={soldCount} tone="green" />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-300">
          Why sell on Kerala Hub
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Perk
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure escrow"
            copy="Funds are released only after the buyer confirms the handover."
          />
          <Perk
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Verified buyers"
            copy="Every buyer goes through KYC so you deal with real gamers, not scammers."
          />
          <Perk
            icon={<Zap className="h-5 w-5" />}
            title="Instant payouts"
            copy="Money lands in your wallet the moment a sale clears."
          />
        </div>
      </section>

      {games.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Latest listings
            </h2>
            <Link
              href="/sell/manage"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            {games.map((g) => (
              <li key={g._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{g.title}</p>
                  <p className="text-[11px] text-gray-500">
                    {g.game.name} · {g.game.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-cyan-300">
                    {formatPrice(g.price.amount, g.price.currency)}
                  </span>
                  <StatusPill status={g.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
          Selling tips
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-300">
          <Tip>
            <strong>Clear photos sell faster.</strong> Screenshot your inventory, rank and key skins.
          </Tip>
          <Tip>
            <strong>Be specific in the title.</strong> Include level, rank, region and standout items.
          </Tip>
          <Tip>
            <strong>Price fairly.</strong> Check <Link href="/explore" className="text-cyan-300 underline">/explore</Link> to see what similar IDs go for.
          </Tip>
        </ul>
      </section>
    </main>
  );
}

function KycBanner({ status }: { status: number }) {
  if (status === KYC.APPROVED) return null;
  const config =
    status === KYC.PENDING
      ? {
          tone: "border-amber-500/30 bg-amber-500/10 text-amber-200",
          icon: <Hourglass className="h-5 w-5 text-amber-300" />,
          title: "Verification under review",
          body: "You can browse the seller hub while we review your documents. Listings unlock the moment it's approved.",
          cta: { href: "/kyc", label: "Check status" },
        }
      : status === KYC.REJECTED
        ? {
            tone: "border-red-500/30 bg-red-500/10 text-red-100",
            icon: <ShieldAlert className="h-5 w-5 text-red-300" />,
            title: "Verification rejected",
            body: "You can't create listings until your KYC is approved. Reach out to support to reopen your case.",
            cta: { href: "/kyc", label: "See details" },
          }
        : {
            tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
            icon: <ShieldAlert className="h-5 w-5 text-cyan-300" />,
            title: "Verify your identity to start selling",
            body: "Kerala Hub requires a one-time KYC check before you can post listings. Takes about 2 minutes.",
            cta: { href: "/kyc", label: "Start verification" },
          };

  return (
    <section
      className={`mt-4 flex flex-col items-start gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${config.tone}`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div>
          <h3 className="text-sm font-bold text-white">{config.title}</h3>
          <p className="text-xs opacity-80">{config.body}</p>
        </div>
      </div>
      <Link
        href={config.cta.href}
        className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
      >
        {config.cta.label}
      </Link>
    </section>
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
    <Card>
      <CardIcon tone="cyan">{icon}</CardIcon>
      <CardHeader className="mt-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{copy}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "cyan" | "green";
}) {
  const color =
    tone === "cyan"
      ? "text-cyan-600 dark:text-cyan-300"
      : tone === "green"
        ? "text-emerald-600 dark:text-emerald-300"
        : "text-slate-900 dark:text-white";
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</div>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-cyan-500/15 text-cyan-300",
    sold: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amber-500/15 text-amber-300",
    removed: "bg-white/10 text-gray-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? "bg-white/10"}`}>
      {status}
    </span>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
      <span>{children}</span>
    </li>
  );
}
