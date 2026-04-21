"use client";

import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { withLocalePath } from "@/lib/i18n-path";
import type {
  AnchorHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

export interface AuthGateProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "onClick"> {
  href: string;
  promptMessage?: string;
  children: ReactNode;
  /** Render as a button instead of a link (skips navigation entirely). */
  asButton?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

/**
 * Wraps a clickable trigger. When the user is authenticated, the trigger
 * navigates to `href`. When not, it opens the shared login-prompt dialog
 * instead. Use this for any auth-gated CTA (create listing, buy, sell, etc.).
 */
export function AuthGate({
  href,
  promptMessage,
  asButton,
  onClick,
  children,
  ...props
}: AuthGateProps) {
  const { isSignedIn, openLoginPrompt } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const handleClick: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = (
    e,
  ) => {
    if (!isSignedIn) {
      e.preventDefault();
      const qs = searchParams?.toString();
      const currentPath = `${withLocalePath(locale, pathname ?? "/")}${qs ? `?${qs}` : ""}`;
      const dest = href ? withLocalePath(locale, href) : currentPath;
      openLoginPrompt(promptMessage, { next: dest });
      return;
    }
    onClick?.(e);
    if (asButton) {
      e.preventDefault();
      router.push(href);
    }
  };

  if (asButton) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={props.className}
        aria-label={props["aria-label"]}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
