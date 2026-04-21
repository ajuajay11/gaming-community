"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserSummary } from "@/services/types";

export interface LoginPromptOptions {
  /** Where to redirect after a successful sign-in. Defaults to the current URL. */
  next?: string;
}

interface AuthContextValue {
  user: UserSummary | null;
  isSignedIn: boolean;
  loginPromptOpen: boolean;
  promptMessage: string | null;
  promptNext: string | null;
  openLoginPrompt: (message?: string, options?: LoginPromptOptions) => void;
  closeLoginPrompt: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: UserSummary | null;
  children: ReactNode;
}) {
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [promptNext, setPromptNext] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: Boolean(user),
      loginPromptOpen,
      promptMessage,
      promptNext,
      openLoginPrompt: (message, options) => {
        setPromptMessage(message ?? null);
        setPromptNext(options?.next ?? null);
        setLoginPromptOpen(true);
      },
      closeLoginPrompt: () => setLoginPromptOpen(false),
    }),
    [user, loginPromptOpen, promptMessage, promptNext],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
