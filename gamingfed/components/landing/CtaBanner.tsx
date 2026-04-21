import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed brand CTA strip used near the bottom of landing pages.
 * Reusable: pass any `eyebrow`, `title`, `description` and up to two CTA
 * buttons. The gradient + glow come from the `brand-gradient` utility so
 * every appearance of this block is instantly on-brand.
 */

interface CtaButton {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
}

export interface CtaBannerProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  primary?: CtaButton;
  secondary?: CtaButton;
  className?: string;
}

export function CtaBanner({
  eyebrow = "Ready when you are",
  title,
  description,
  primary,
  secondary,
  className,
}: CtaBannerProps) {
  return (
    <section
      className={cn(
        "relative mt-14 overflow-hidden rounded-3xl p-8 md:mt-20 md:p-12",
        // Big, unashamed brand gradient — consistent with the hero so the
        // page closes on the same visual note it opened on.
        "brand-gradient",
        "shadow-[0_30px_80px_-30px_rgba(99,102,241,0.65)]",
        className,
      )}
    >
      {/* Soft overlay mask so white text stays legible over the gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)]"
      />
      {/* Decorative sparkle in the corner. */}
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 h-8 w-8 text-white/40 md:right-10 md:top-10 md:h-10 md:w-10"
      />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white ring-1 ring-inset ring-white/20 backdrop-blur">
          {eyebrow}
        </span>
        <h2 className="mt-4 text-white text-balance">{title}</h2>
        {description && (
          <p className="mt-3 text-white/85">{description}</p>
        )}
        {(primary || secondary) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {primary && (
              <Link
                href={primary.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                {primary.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/20"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
