"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export type ConfirmVariant = "danger" | "primary";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Reusable confirm dialog. Mirrors LoginPromptDialog styling so modals feel
 * consistent. Uses CSS keyframe enter animations (no Motion).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => confirmRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, pending, onClose]);

  const confirmClasses =
    variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-500/90"
      : "bg-gradient-to-r from-cyan-400 to-cyan-600 text-black hover:opacity-90";

  const iconWrap =
    variant === "danger"
      ? "bg-red-500/10 ring-2 ring-red-400 text-red-300"
      : "bg-cyan-500/10 ring-2 ring-cyan-400 text-cyan-300";

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => !pending && onClose()}
        disabled={pending}
        className="dialog-animate-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm disabled:cursor-not-allowed"
      />
      <div className="dialog-animate-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#15181e] p-6 text-white shadow-2xl dark:bg-[#15181e]">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          disabled={pending}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 disabled:opacity-40"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${iconWrap}`}
        >
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>

        <h2 id={titleId} className="mt-4 text-center text-xl font-extrabold">
          {title}
        </h2>
        {description && (
          <div className="mt-2 text-center text-sm text-gray-400">
            {description}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full bg-white/5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition disabled:opacity-60 ${confirmClasses}`}
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
