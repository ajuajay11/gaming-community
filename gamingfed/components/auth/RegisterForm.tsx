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

type Step = "identify" | "verify" | "password";

const PASSWORD_RX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export interface RegisterFormProps {
  next?: string;
}

function detectIdentifier(value: string): { email?: string; phone?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.includes("@")) return { email: trimmed.toLowerCase() };
  return { phone: trimmed.replace(/\s/g, "") };
}

export function RegisterForm({ next }: RegisterFormProps) {
  const t = useTranslations("auth.register");
  const tc = useTranslations("auth.common");
  const router = useRouter();
  const [step, setStep] = useState<Step>("identify");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startPending] = useTransition();

  const id = useMemo(() => detectIdentifier(identifier), [identifier]);
  const identifierIsEmail = identifier.includes("@");
  const passwordOk = PASSWORD_RX.test(password);

  const sendOtp = () => {
    setStatus(null);
    setError(null);
    if (!id.email && !id.phone) {
      setError(t("errNeedIdentifier"));
      return;
    }
    startPending(async () => {
      try {
        await authService.generateOtp({ ...id, purpose: "register" });
        setStatus(t("codeSent"));
        setStep("verify");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("errSendCode"));
      }
    });
  };

  const verify = () => {
    setStatus(null);
    setError(null);
    if (!code) {
      setError(t("errNeedCode"));
      return;
    }
    startPending(async () => {
      try {
        await authService.verifyOtp({ ...id, code, purpose: "register" });
        setStep("password");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("errInvalidCode"));
      }
    });
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!passwordOk) {
      setError(t("errPasswordRules"));
      return;
    }
    startPending(async () => {
      try {
        await authService.register({ ...id, password, role: "gamer" });
        router.replace(next && next.startsWith("/") ? next : "/");
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("errCreate"));
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

        <Steps step={step} />

        {step === "identify" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
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
              hint={status}
            />
            <ErrorBanner error={error} />
            <SubmitButton pending={isPending} icon={<Send className="w-4 h-4" />}>
              {tc("sendVerificationCode")}
            </SubmitButton>
          </form>
        )}

        {step === "verify" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <p className="text-xs text-gray-400">
              {t("verifyIntroBefore")}{" "}
              <span className="text-white font-semibold">{identifier}</span>
              {t("verifyIntroAfter")}
            </p>
            <AuthField
              label={tc("oneTimeCode")}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              placeholder={tc("otpPlaceholder")}
              required
              hint={status}
            />
            <ErrorBanner error={error} />
            <SubmitButton
              pending={isPending}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {tc("verifyCode")}
            </SubmitButton>
            <button
              type="button"
              onClick={() => {
                setStep("identify");
                setCode("");
                setStatus(null);
                setError(null);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              {t("differentId")}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={submitRegister} className="flex flex-col gap-4">
            <AuthField
              label={tc("password")}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={tc("passwordPlaceholderNew")}
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
              hint={
                password.length === 0
                  ? undefined
                  : passwordOk
                    ? tc("passwordOk")
                    : tc("passwordRules")
              }
              required
              minLength={8}
            />
            <ErrorBanner error={error} />
            <SubmitButton
              pending={isPending}
              icon={<CheckCircle2 className="w-4 h-4" />}
              disabled={!passwordOk}
            >
              {t("createAccount")}
            </SubmitButton>
            <p className="text-[11px] text-center text-gray-500">
              {t("agreePrefix")}{" "}
              <Link href="/terms" className="text-gray-300 hover:text-white">
                {t("terms")}
              </Link>{" "}
              {t("agreeAnd")}{" "}
              <Link href="/privacy" className="text-gray-300 hover:text-white">
                {t("privacy")}
              </Link>
              {t("agreeSuffix")}
            </p>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          {t("alreadyHave")}{" "}
          <Link
            href={{
              pathname: "/login",
              query: next ? { next } : undefined,
            }}
            className="text-cyan-300 hover:underline"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const t = useTranslations("auth.register");
  const steps: Array<{ id: Step; labelKey: "stepIdentify" | "stepVerify" | "stepPassword" }> = [
    { id: "identify", labelKey: "stepIdentify" },
    { id: "verify", labelKey: "stepVerify" },
    { id: "password", labelKey: "stepPassword" },
  ];
  const activeIndex = steps.findIndex((s) => s.id === step);
  return (
    <ol className="mb-6 flex items-center justify-between gap-2">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={s.id} className="flex-1 flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                done
                  ? "bg-cyan-400 text-black"
                  : active
                    ? "bg-white text-black"
                    : "bg-white/10 text-gray-500",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-[11px] uppercase tracking-wider",
                active ? "text-white" : "text-gray-500",
              )}
            >
              {t(s.labelKey)}
            </span>
            {i < steps.length - 1 && (
              <span className="flex-1 h-px bg-white/10" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300"
    >
      {error}
    </p>
  );
}

function SubmitButton({
  pending,
  icon,
  disabled,
  children,
}: {
  pending: boolean;
  icon: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 py-3 text-sm font-bold disabled:opacity-60"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
