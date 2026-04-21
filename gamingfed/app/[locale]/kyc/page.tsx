import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Hourglass,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { profileService } from "@/services/profile.service";
import { KycForm } from "@/components/kyc/KycForm";
import { KYC, kycLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Identity verification — Kerala Hub",
  description:
    "Complete KYC to unlock selling, payouts and verified-only messaging on Kerala Hub.",
};

export default async function KycPage() {
  await requireUser("/kyc");

  const account = await profileService.getMyAccount().catch(() => null);
  const status = Number(account?.kycSummary?.kycStatus ?? KYC.NOT_SUBMITTED);

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      <header className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Identity verification</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-400">
            KYC unlocks payouts, higher listing limits and verified-only chat.
            We never display your legal identity publicly — it stays private.
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      {status === KYC.APPROVED && (
        <SuccessPanel />
      )}

      {status === KYC.PENDING && (
        <PendingPanel />
      )}

      {status === KYC.REJECTED && (
        <RejectedPanel />
      )}

      {status === KYC.NOT_SUBMITTED && (
        <>
          <Benefits />
          <KycForm />
        </>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: number }) {
  const map: Record<number, string> = {
    [KYC.NOT_SUBMITTED]: "bg-white/10 text-gray-300",
    [KYC.PENDING]: "bg-amber-500/15 text-amber-300",
    [KYC.APPROVED]: "bg-emerald-500/15 text-emerald-300",
    [KYC.REJECTED]: "bg-red-500/15 text-red-300",
  };
  const Icon =
    status === KYC.APPROVED
      ? ShieldCheck
      : status === KYC.PENDING
        ? Hourglass
        : ShieldAlert;
  return (
    <span
      className={`inline-flex items-center gap-1 self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${map[status] ?? map[0]}`}
    >
      <Icon className="h-3 w-3" />
      {kycLabel(status)}
    </span>
  );
}

function SuccessPanel() {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-emerald-300" />
        <div>
          <h2 className="text-lg font-bold">You&apos;re verified</h2>
          <p className="text-sm text-emerald-200/80">
            Your identity has been approved. Sell, buy and get paid without
            limits.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/sell/new"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-bold text-black"
        >
          Create a listing
        </Link>
        <Link
          href="/profile"
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
        >
          Back to profile
        </Link>
      </div>
    </div>
  );
}

function PendingPanel() {
  return (
    <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
      <div className="flex items-center gap-3">
        <Hourglass className="h-6 w-6 text-amber-300" />
        <div>
          <h2 className="text-lg font-bold">Under review</h2>
          <p className="text-sm text-amber-100/80">
            We&apos;ve received your documents. Reviews normally take 24–48 hours on
            business days. You&apos;ll get an email when it&apos;s done.
          </p>
        </div>
      </div>
      <ol className="mt-4 space-y-1.5 text-xs text-amber-100/80">
        <li>1. Documents submitted ✓</li>
        <li>2. Manual review (in progress)</li>
        <li>3. Decision emailed to you</li>
      </ol>
    </div>
  );
}

function RejectedPanel() {
  return (
    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-red-300" />
        <div>
          <h2 className="text-lg font-bold">Verification rejected</h2>
          <p className="text-sm text-red-100/80">
            Your submission couldn&apos;t be approved. Common reasons: blurry photo,
            name mismatch, or unreadable ID. Reach out to support to reopen your
            case.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="mailto:support@keralahub.gg"
          className="rounded-full bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/30"
        >
          Contact support
        </a>
        <Link
          href="/chat"
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
        >
          Open chat
        </Link>
      </div>
    </div>
  );
}

function Benefits() {
  return (
    <section className="mt-6 grid gap-3 md:grid-cols-3">
      <Benefit
        title="Unlocks payouts"
        copy="Required before you can receive money from any sale."
      />
      <Benefit
        title="Verified badge"
        copy="Live face check plus your details — instant verified status when you submit."
      />
      <Benefit
        title="Dispute protection"
        copy="Verified users get priority mediation on every transaction."
      />
    </section>
  );
}

function Benefit({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-cyan-300" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <p className="mt-1 text-xs text-gray-400">{copy}</p>
    </div>
  );
}
