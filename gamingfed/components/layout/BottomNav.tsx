"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Home as HomeIcon,
  Compass,
  Plus,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  match?: (pathname: string) => boolean;
  badge?: boolean;
  fillWhenActive?: boolean;
  requiresAuth?: boolean;
  promptMessage?: string;
}

export function BottomNav() {
  const t = useTranslations("bottomNav");
  const pathname = usePathname();
  const { isSignedIn, openLoginPrompt } = useAuth();

  const NAV_ITEMS: NavItem[] = useMemo(
    () => [
      {
        href: "/",
        label: t("home"),
        Icon: HomeIcon,
        match: (p) => p === "/",
        fillWhenActive: true,
      },
      {
        href: "/explore",
        label: t("explore"),
        Icon: Compass,
        match: (p) => p.startsWith("/explore"),
      },
      {
        href: "/chat",
        label: t("chat"),
        Icon: MessageSquare,
        match: (p) => p.startsWith("/chat"),
        badge: true,
        requiresAuth: true,
        promptMessage: t("chatPrompt"),
      },
      {
        href: "/profile",
        label: t("profile"),
        Icon: User,
        match: (p) => p.startsWith("/profile"),
        requiresAuth: true,
        promptMessage: t("profilePrompt"),
      },
    ],
    [t],
  );

  const handleCreateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSignedIn) {
      e.preventDefault();
      openLoginPrompt(t("sellPrompt"));
    }
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "rounded-t-2xl border-t border-black/5 bg-white text-black shadow-[0_-8px_24px_rgba(15,23,42,0.08)]",
        "dark:border-white/5 dark:bg-[#0f1114] dark:text-white dark:shadow-[0_-8px_24px_rgba(0,0,0,0.35)]",
        "transition-colors",
      )}
    >
      <ul className="relative grid grid-cols-5 items-end h-16 px-2">
        <BottomNavTab item={NAV_ITEMS[0]} pathname={pathname} />
        <BottomNavTab item={NAV_ITEMS[1]} pathname={pathname} />
        <li className="flex justify-center">
          <Link
            href="/sell"
            onClick={handleCreateClick}
            prefetch={isSignedIn ? undefined : false}
            aria-label={t("createAria")}
            className={cn(
              "absolute -top-6 left-1/2 -translate-x-1/2",
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
              "bg-black text-white hover:bg-gray-800 ring-4 ring-white",
              "dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:ring-[#0f1114]",
            )}
          >
            <Plus className="w-7 h-7" strokeWidth={3} aria-hidden />
          </Link>
        </li>
        <BottomNavTab item={NAV_ITEMS[2]} pathname={pathname} />
        <BottomNavTab item={NAV_ITEMS[3]} pathname={pathname} />
      </ul>
    </nav>
  );
}

function BottomNavTab({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const { isSignedIn, openLoginPrompt } = useAuth();
  const isActive = item.match?.(pathname) ?? false;
  const { Icon } = item;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.requiresAuth && !isSignedIn) {
      e.preventDefault();
      openLoginPrompt(item.promptMessage);
    }
  };

  const shouldPrefetch = item.requiresAuth && !isSignedIn ? false : undefined;

  return (
    <li>
      <Link
        href={item.href}
        onClick={handleClick}
        prefetch={shouldPrefetch}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 w-full h-16",
          isActive
            ? "text-cyan-600 dark:text-cyan-400"
            : "text-gray-500 dark:text-gray-400",
        )}
      >
        <span className="relative">
          <Icon
            className={cn(
              "w-6 h-6",
              isActive && item.fillWhenActive && "fill-current",
            )}
            aria-hidden
          />
          {item.badge && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f1114]"
            />
          )}
        </span>
        <span className={cn("text-xs", isActive && "font-semibold")}>
          {item.label}
        </span>
      </Link>
    </li>
  );
}
