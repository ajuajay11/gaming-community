"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  const handle = () => {
    start(async () => {
      try {
        await authService.logout();
      } catch {
        // Even if the server call fails we still want to clear the UI state.
      }
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/25 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      Sign out
    </button>
  );
}
