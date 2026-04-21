import { apiFetch } from "@/lib/api/client";
import type { UserSummary, UserRole } from "./types";

export type OtpPurpose = "login" | "register" | "forgot-password";

export interface EmailOrPhone {
  email?: string;
  phone?: string;
}

export const authService = {
  register: (payload: EmailOrPhone & { password: string; role: UserRole }) =>
    apiFetch<{ userId: string; email?: string; phone?: string; role: UserRole }>(
      "/auth/register",
      { method: "POST", body: payload as unknown as Record<string, unknown> },
    ),

  login: (payload: EmailOrPhone & { password: string }) =>
    apiFetch<{ user: UserSummary }>("/auth/login", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  loginWithOtp: (
    payload: EmailOrPhone & { code: string; purpose: "login" | "forgot-password" },
  ) =>
    apiFetch<{ user: UserSummary }>("/auth/login-with-otp", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  generateOtp: (payload: EmailOrPhone & { purpose: OtpPurpose }) =>
    apiFetch<{ message: string }>("/auth/generate-otp", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  verifyOtp: (
    payload: EmailOrPhone & { code: string; purpose?: "register" | "forgot-password" },
  ) =>
    apiFetch<{ message: string }>("/auth/verify-otp", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  resetPassword: (payload: EmailOrPhone & { newPassword: string }) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  googleComplete: (payload: { tempToken: string; role: UserRole }) =>
    apiFetch<{ user: UserSummary }>("/auth/google-complete", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    }),

  getMe: () => apiFetch<{ user: UserSummary }>("/auth/me"),

  logout: () =>
    apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),

  session: () =>
    apiFetch<{ role: UserRole; status: UserSummary["status"] }>("/auth/session", {
      method: "POST",
    }),

  deleteAccount: (payload: { password?: string } = {}) =>
    apiFetch<{ message: string }>("/auth/account", {
      method: "DELETE",
      body: payload as unknown as Record<string, unknown>,
    }),
};
