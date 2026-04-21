import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export interface PriceTagProps {
  amount: number;
  currency?: string;
  signedIn: boolean;
  short?: boolean;
  className?: string;
  lockedLabel?: string;
}

/**
 * Displays a price when the viewer is signed in, otherwise shows a locked
 * placeholder. Use for any listing price on public pages.
 */
export function PriceTag({
  amount,
  currency = "USD",
  signedIn,
  short,
  className,
  lockedLabel = "Sign in to view",
}: PriceTagProps) {
  if (!signedIn) {
    return (
      <span
        aria-label={lockedLabel}
        title={lockedLabel}
        className={cn(
          "inline-flex items-center gap-1 font-extrabold tracking-wider text-app-fg",
          className,
        )}
      >
        <Lock className="w-3.5 h-3.5" aria-hidden />
        <span aria-hidden>***</span>
      </span>
    );
  }
  return (
    <span className={cn("font-extrabold tracking-tight", className)}>
      {formatPrice(amount, currency, { short })}
    </span>
  );
}
