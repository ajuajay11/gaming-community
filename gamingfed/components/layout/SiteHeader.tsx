import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Bell } from "lucide-react";
import Logo from "@/public/images/kgh_icon_v4_electric_blue__1___Edited_-removebg-preview.png";
import { Avatar } from "@/components/common/Avatar";
import { IconButton } from "@/components/common/IconButton";
import { SearchInput } from "@/components/common/SearchInput";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { UserSummary } from "@/services/types";

export interface SiteHeaderProps {
  user?: UserSummary | null;
}

export async function SiteHeader({ user }: SiteHeaderProps) {
  const t = await getTranslations("nav");
  const isSignedIn = Boolean(user);
  return (
    <header className="border-b border-black/10 bg-white text-black transition-colors dark:border-white/10 dark:bg-[#0f1114] dark:text-white">
      <div className="container mx-auto flex min-h-[3.25rem] items-center gap-2 px-3 py-2 sm:min-h-14 sm:gap-3 sm:px-4 sm:py-2.5 md:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center self-center"
          aria-label={t("homeAria")}
        >
          <Image
            src={Logo}
            alt=""
            width={140}
            height={68}
            className="h-12 w-auto object-contain object-left "
            priority
          />
        </Link>

        <SearchInput
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          wrapperClassName="min-h-10 min-w-0 flex-1 sm:min-h-12"
        />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <LocaleSwitcher />
          <AnimatedThemeToggler
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10 [&_svg]:h-4 [&_svg]:w-4"
            aria-label={t("toggleTheme")}
          />
          {isSignedIn ? (
            <>
              <IconButton
                label={t("notifications")}
                dot
                icon={<Bell className="h-5 w-5" aria-hidden />}
              />
              <Avatar href="/profile" alt={t("profileAlt")} />
            </>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-black sm:px-4 sm:text-sm"
            >
              {t("signIn")} 
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
