import { Link } from "@/i18n/navigation";
import { ArrowLeft, Hourglass, ShieldAlert, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { profileService } from "@/services/profile.service";
import { ListingForm } from "@/components/sell/ListingForm";
import { KYC, kycLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create listing — Kerala Hub",
};

export default async function NewListingPage() {
  await requireUser("/sell/new");

  // Backend will 403 if KYC isn't approved; we mirror that on the server so
  // the user sees a proper explanation page instead of a form that rejects
  // their upload at the last second.
  const account = await profileService.getMyAccount().catch(() => null);
  const kycStatus = Number(account?.kycSummary?.kycStatus ?? KYC.NOT_SUBMITTED);
  const kycApproved = kycStatus === KYC.APPROVED;

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/sell"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to seller hub
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">Create listing</h1>
      <p className="mt-1 text-sm text-gray-400">
        Tell buyers exactly what they&apos;re getting. Listings with crisp photos and honest details sell 3× faster.
      </p>

      {kycApproved ? <ListingForm /> : <KycGate status={kycStatus} />}
    </main>
  );
}

function KycGate({ status }: { status: number }) {
  if (status === KYC.PENDING) {
    return (
      <GateCard
        tone="amber"
        icon={<Hourglass className="h-6 w-6 text-amber-300" />}
        title="KYC under review"
        body="We're checking your documents. You'll be able to post listings the moment it's approved — usually within 24–48 hours."
        cta={{ href: "/kyc", label: "View verification status" }}
      />
    );
  }
  if (status === KYC.REJECTED) {
    return (
      <GateCard
        tone="red"
        icon={<ShieldAlert className="h-6 w-6 text-red-300" />}
        title="KYC rejected"
        body="Your last submission didn't pass review. Reach out to support to reopen your case — once approved you can list instantly."
        cta={{ href: "/kyc", label: "See details" }}
      />
    );
  }
  return (
    <GateCard
      tone="cyan"
      icon={<ShieldCheck className="h-6 w-6 text-cyan-300" />}
      title="Verify your identity first"
      body="To protect buyers, Kerala Hub requires KYC verification before you can create a listing. It takes about 2 minutes."
      cta={{ href: "/kyc", label: "Start verification" }}
      status={status}
    />
  );
}

function GateCard({
  tone,
  icon,
  title,
  body,
  cta,
  status,
}: {
  tone: "amber" | "red" | "cyan";
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
  status?: number;
}) {
  const border =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/10"
      : tone === "red"
        ? "border-red-500/30 bg-red-500/10"
        : "border-cyan-500/30 bg-cyan-500/10";
  const btn =
    tone === "amber"
      ? "bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
      : tone === "red"
        ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
        : "bg-gradient-to-r from-cyan-400 to-cyan-600 text-black";

  return (
    <div className={`mt-6 rounded-2xl border p-6 ${border}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-gray-200/90">{body}</p>
          {status !== undefined && (
            <p className="mt-2 text-[11px] uppercase tracking-widest text-gray-400">
              Current status: {kycLabel(status)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5">
        <Link
          href={cta.href}
          className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold ${btn}`}
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
