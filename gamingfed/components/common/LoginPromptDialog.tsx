"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { withLocalePath } from "@/lib/i18n-path";
import { LogIn, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LoginPromptDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const tl = useTranslations("loginPrompt");
  const { loginPromptOpen, promptMessage, promptNext, closeLoginPrompt } =
    useAuth();

  useEffect(() => {
    if (!loginPromptOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLoginPrompt();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [loginPromptOpen, closeLoginPrompt]);

  const goToLogin = () => {
    closeLoginPrompt();
    const qs = searchParams?.toString();
    const fallback = `${withLocalePath(locale, pathname ?? "/")}${qs ? `?${qs}` : ""}`;
    const next = promptNext ?? fallback;
    const loginBase = `/${locale}/login`;
    const nextPathOnly = next.split("?")[0] ?? "";
    const isLogin =
      nextPathOnly === loginBase || nextPathOnly === "/login";
    const target =
      next && !isLogin
        ? `${loginBase}?next=${encodeURIComponent(next)}`
        : loginBase;
    router.push(target);
  };

  if (!loginPromptOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={closeLoginPrompt}
        className="dialog-animate-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="dialog-animate-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#15181e] p-6 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={closeLoginPrompt}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 ring-2 ring-cyan-400">
          <LogIn className="h-6 w-6 text-cyan-400" aria-hidden />
        </div>
        <h2
          id="login-prompt-title"
          className="mt-4 text-center text-xl font-extrabold"
        >
          {tl("title")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {promptMessage ?? tl("defaultMessage")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={closeLoginPrompt}
            className="rounded-full bg-white/5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
          >
            {tl("notNow")}
          </button>
          <button
            type="button"
            onClick={goToLogin}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 py-2.5 text-sm font-semibold transition hover:opacity-90"
          >
            {tl("signIn")}
          </button>
        </div>
      </div>
    </div>
  );
}
