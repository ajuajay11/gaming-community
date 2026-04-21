import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared page section shell — gives every landing/listing block the same
 * spacing, eyebrow treatment, title hierarchy and "view all" slot. Use it
 * anywhere you'd otherwise hand-roll
 * `<section className="mt-10"><h2>…</h2><Link>View all</Link>…</section>`.
 *
 * Heading sizes are driven by globals.css typography, so we don't re-spec
 * them here. Only layout and brand colouring live in this component.
 */
export interface SectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Small coloured label above the title, e.g. "TRENDING NOW". */
  eyebrow?: React.ReactNode;
  /** Small icon rendered before the eyebrow text. */
  eyebrowIcon?: React.ReactNode;
  /** Main heading for the section. Accepts a string or nodes (for gradient). */
  title?: React.ReactNode;
  /** One-liner under the title, gives context. */
  description?: React.ReactNode;
  /** Right-side slot (e.g. a `View all →` link). */
  action?: React.ReactNode;
  /** Tighter spacing when the block should sit flush. Defaults to `md`. */
  spacing?: "sm" | "md" | "lg";
  /**
   * Centre-align the header (good for final CTAs / FAQ). Body children still
   * flow naturally underneath.
   */
  align?: "left" | "center";
}

const spacingMap: Record<NonNullable<SectionProps["spacing"]>, string> = {
  sm: "mt-6 md:mt-8",
  md: "mt-10 md:mt-14",
  lg: "mt-14 md:mt-20",
};

export function Section({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  action,
  spacing = "md",
  align = "left",
  className,
  children,
  ...rest
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || description || action);
  return (
    <section
      className={cn(spacingMap[spacing], className)}
      {...rest}
    >
      {hasHeader && (
        <header
          className={cn(
            "mb-5 flex gap-4 md:mb-6",
            align === "center"
              ? "flex-col items-center text-center"
              : "flex-col justify-between md:flex-row md:items-end",
          )}
        >
          <div className={cn(align === "center" && "max-w-2xl")}>
            {eyebrow && (
              <div
                className={cn(
                  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
                  "text-cyan-600 dark:text-cyan-300",
                  align === "center" && "justify-center",
                )}
              >
                {eyebrowIcon}
                <span>{eyebrow}</span>
              </div>
            )}
            {title && (
              <h2
                className={cn(
                  "mt-2 text-slate-900 dark:text-white",
                  align === "center" ? "text-balance" : undefined,
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-2 max-w-2xl text-slate-600 dark:text-gray-300",
                  align === "center" && "mx-auto",
                )}
              >
                {description}
              </p>
            )}
          </div>
          {action && align !== "center" && (
            <div className="shrink-0">{action}</div>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
