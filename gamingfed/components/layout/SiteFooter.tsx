import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "@/public/images/ssss.png";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="hidden md:block border-t bg-white text-black border-black/5 dark:bg-black dark:text-white dark:border-white/10 transition-colors">
      <div className="container mx-auto flex justify-between items-center px-5 py-6 gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Kerala Hub"
            width={40}
            height={40}
            className="h-auto w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
          <Link href="/terms" className="hover:text-black dark:hover:text-white">
            {t("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-black dark:hover:text-white">
            {t("privacy")}
          </Link>
          <Link href="/faq" className="hover:text-black dark:hover:text-white">
            {t("faq")}
          </Link>
        </nav>
        <p className="text-xs text-gray-500">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
