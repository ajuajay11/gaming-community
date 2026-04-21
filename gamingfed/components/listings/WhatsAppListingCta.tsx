"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AuthGate } from "@/components/common/AuthGate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { KYC } from "@/lib/status";
import { cn } from "@/lib/utils";

export interface WhatsAppListingCtaProps {
  /** Ready-to-open wa.me URL; null when contact is locked server-side. */
  href: string | null;
  className?: string;
}

/**
 * Opens WhatsApp only when the visitor is signed in and KYC-approved (href
 * is only non-null then). Otherwise mirrors AuthGate / KYC prompt behaviour.
 */
export function WhatsAppListingCta({ href, className }: WhatsAppListingCtaProps) {
  const { isSignedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [kycDialogOpen, setKycDialogOpen] = useState(false);

  const kycOk = Number(user?.kycStatus) === KYC.APPROVED;

  const innerClass = cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/35 bg-emerald-500/12 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-500/18 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={innerClass}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Chat on WhatsApp
      </a>
    );
  }

  if (!isSignedIn) {
    return (
      <AuthGate
        href={pathname || "/"}
        className={innerClass}
        promptMessage="Sign in to message the seller on WhatsApp."
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Chat on WhatsApp
      </AuthGate>
    );
  }

  if (!kycOk) {
    return (
      <>
        <button type="button" onClick={() => setKycDialogOpen(true)} className={innerClass}>
          <MessageCircle className="h-4 w-4" aria-hidden />
          Chat on WhatsApp
        </button>
        <ConfirmDialog
          open={kycDialogOpen}
          title="Verify your identity first"
          description="To protect sellers, WhatsApp and phone details are shown only after Kerala Hub approves your KYC. Submit or complete verification, then come back to this listing."
          confirmLabel="Go to KYC"
          cancelLabel="Not now"
          variant="primary"
          onClose={() => setKycDialogOpen(false)}
          onConfirm={() => {
            setKycDialogOpen(false);
            const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
            router.push(`/kyc${next}`);
          }}
        />
      </>
    );
  }

  /* KYC approved but seller has no phone / WhatsApp on file */
  return null;
}
