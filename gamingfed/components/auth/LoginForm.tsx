"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api/types";
import { AuthField } from "./AuthField";
import { cn } from "@/lib/utils";

type LoginMode = "password" | "otp";

export interface LoginFormProps {
  next?: string;
}

function detectIdentifier(value: string): { email?: string; phone?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.includes("@")) return { email: trimmed.toLowerCase() };
  return { phone: trimmed.replace(/\s/g, "") };
}

export function LoginForm({ next }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const tc = useTranslations("auth.common");
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSendingOtp, startOtp] = useTransition();

  const identifierField = useMemo(() => detectIdentifier(identifier), [identifier]);
  const identifierIsEmail = identifier.includes("@");

  const redirectToNext = () => {
    router.replace(next && next.startsWith("/") ? next : "/");
    router.refresh();
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifierField.email && !identifierField.phone) {
      setError(t("errNeedIdentifier"));
      return;
    }
    startTransition(async () => {
      try {
        await authService.login({ ...identifierField, password });
        redirectToNext();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("errSignInFailed"));
      }
    });
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifierField.email && !identifierField.phone) {
      setError(t("errNeedIdentifier"));
      return;
    }
    startTransition(async () => {
      try {
        await authService.loginWithOtp({
          ...identifierField,
          code,
          purpose: "login",
        });
        redirectToNext();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("errSignInFailed"));
      }
    });
  };

  const sendOtp = () => {
    setOtpStatus(null);
    if (!identifierField.email && !identifierField.phone) {
      setOtpStatus(t("otpNeedIdentifierFirst"));
      return;
    }
    startOtp(async () => {
      try {
        await authService.generateOtp({ ...identifierField, purpose: "login" });
        setOtpSent(true);
        setOtpStatus(t("otpSent"));
      } catch (err) {
        setOtpStatus(err instanceof ApiError ? err.message : t("otpSendFailed"));
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-400">{t("subtitle")}</p>
        </div>

        <div
          role="tablist"
          aria-label={tc("signInMethodAria")}
          className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1"
        >
          <ModeTab
            active={mode === "password"}
            onClick={() => {
              setMode("password");
              setError(null);
            }}
            icon={<KeyRound className="w-3.5 h-3.5" />}
            label={tc("passwordTab")}
          />
          <ModeTab
            active={mode === "otp"}
            onClick={() => {
              setMode("otp");
              setError(null);
            }}
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label={tc("otpTab")}
          />
        </div>

        {mode === "password" ? (
          <form onSubmit={submitPassword} className="flex flex-col gap-4">
            <AuthField
              label={tc("emailOrPhone")}
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder={tc("placeholderId")}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={
                identifierIsEmail ? (
                  <AtSign className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )
              }
              required
            />
            <AuthField
              label={tc("password")}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={tc("passwordPlaceholderDots")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-white p-1"
                  aria-label={showPassword ? tc("hidePassword") : tc("showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              required
              minLength={8}
            />
            <FormFooter pending={isPending} label={t("signInSubmit")} error={error} />
          </form>
        ) : (
          <form onSubmit={submitOtp} className="flex flex-col gap-4">
            <AuthField
              label={tc("emailOrPhone")}
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder={tc("placeholderId")}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={
                identifierIsEmail ? (
                  <AtSign className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )
              }
              rightSlot={
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={isSendingOtp}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-400 text-black text-xs font-semibold px-3 py-1 disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  {otpSent ? tc("resend") : tc("send")}
                </button>
              }
              hint={otpStatus}
              required
            />
            <AuthField
              label={tc("oneTimeCode")}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={tc("otpPlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              required
            />
            <FormFooter
              pending={isPending}
              label={t("verifySubmit")}
              error={error}
            />
          </form>
        )}

        <div className="mt-6 flex justify-between text-xs text-gray-400">
          <Link href="/forgot-password" className="hover:text-white">
            {t("forgotLink")}
          </Link>
          <Link
            href={{
              pathname: "/register",
              query: next ? { next } : undefined,
            }}
            className="text-cyan-300 hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition",
        active
          ? "bg-white text-black shadow"
          : "text-gray-300 hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FormFooter({
  pending,
  label,
  error,
}: {
  pending: boolean;
  label: string;
  error?: string | null;
}) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 py-3 text-sm font-bold disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        {label}
      </button>
    </>
  );
}
