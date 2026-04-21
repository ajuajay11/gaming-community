"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AuthFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

/**
 * Dark, rounded input used on the auth pages. Handles label, hint and error
 * display in a consistent way.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    { label, hint, error, leftIcon, rightSlot, id, className, ...props },
    ref,
  ) {
    const generated = useId();
    const inputId = id ?? generated;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-medium text-gray-300">
          {label}
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-white/5 px-3",
            "focus-within:border-cyan-400/70 focus-within:bg-white/10 transition",
            error ? "border-red-500/60" : "border-white/10",
          )}
        >
          {leftIcon && (
            <span className="text-gray-500 shrink-0" aria-hidden>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent py-2.5 text-sm text-inherit placeholder:text-gray-500 focus:outline-none",
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-err` : undefined}
            {...props}
          />
          {rightSlot}
        </div>
        {error ? (
          <p id={`${inputId}-err`} className="text-xs text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-gray-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);
