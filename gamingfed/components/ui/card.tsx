import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable surface primitive. Use this anywhere you'd otherwise type
 * `rounded-2xl border border-white/10 bg-white/[0.02] ...`. It's theme-aware,
 * supports a few common tones, and composes with optional sub-parts
 * (CardHeader, CardTitle, CardDescription, CardBody, CardFooter).
 *
 * Kept deliberately small — add props only when we actually need them.
 */

type CardTone = "default" | "cyan" | "green" | "amber" | "red" | "muted";

const toneClasses: Record<CardTone, string> = {
  default:
    "border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none",
  cyan: "border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10",
  green: "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
  amber: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
  red: "border-red-500/30 bg-red-500/5 dark:bg-red-500/10",
  muted:
    "border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/[0.015]",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6 md:p-8",
} as const;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: keyof typeof paddingClasses;
  interactive?: boolean;
  as?: React.ElementType;
}

export function Card({
  tone = "default",
  padding = "md",
  interactive = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border transition-colors",
        toneClasses[tone],
        paddingClasses[padding],
        interactive &&
          "cursor-pointer hover:border-slate-300 hover:bg-slate-50 dark:hover:border-white/20 dark:hover:bg-white/[0.05]",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  as: Tag = "h3",
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Tag
      className={cn(
        "text-sm font-bold text-slate-900 dark:text-white",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs text-slate-500 dark:text-gray-400",
        className,
      )}
      {...rest}
    />
  );
}

export function CardBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-3", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Small utility wrapper for the common "icon chip" inside a card header
 * (coloured circular badge around a Lucide icon). Keeps perk-style cards
 * from repeating the same `h-9 w-9 rounded-full bg-*` markup.
 */
export function CardIcon({
  tone = "cyan",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Only `cyan` / `slate` / `brand` are on-palette. `green` / `amber` /
   * `red` are reserved for *semantic* states (success/warning/error) and
   * should not be used decoratively — keep the page mono-chromatic.
   */
  tone?: "cyan" | "slate" | "brand" | "green" | "amber" | "red";
}) {
  const colours: Record<string, string> = {
    cyan: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
    slate: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    // Brand = the KG gradient (pale cyan → cyan → deep teal). White icon
    // glyph on top, subtle light ring for depth.
    brand:
      "bg-[linear-gradient(135deg,rgba(103,232,249,0.28),rgba(14,116,144,0.28))] text-white ring-1 ring-inset ring-white/20",
    // Semantic-only tones below — use sparingly.
    green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    red: "bg-red-500/15 text-red-600 dark:text-red-300",
  };
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full",
        colours[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
