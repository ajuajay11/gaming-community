"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirectLocal } from "@/lib/i18n-redirect";
import { routing } from "@/i18n/routing";
import { apiFetchWithCookieSync } from "@/lib/api/server";
import type { UserRole, UserSummary } from "@/services/types";
import {
  runAction,
  requireString,
  pickString,
  type ActionState,
} from "./_helpers";

type EmailOrPhone = { email?: string; phone?: string };

function pickEmailOrPhone(form: FormData): EmailOrPhone {
  const email = pickString(form, "email");
  const phone = pickString(form, "phone");
  if (!email && !phone) throw new Error("Email or phone is required");
  return email ? { email } : { phone };
}

export async function registerAction(
  _prev: ActionState<{ userId: string }>,
  form: FormData,
): Promise<ActionState<{ userId: string }>> {
  return runAction(async () => {
    const payload = {
      ...pickEmailOrPhone(form),
      password: requireString(form, "password"),
      role: (pickString(form, "role") as UserRole) ?? "gamer",
    };
    const data = await apiFetchWithCookieSync<{
      userId: string;
      email?: string;
      phone?: string;
      role: UserRole;
    }>("/auth/register", { method: "POST", body: payload });
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}`, "layout");
    }
    return { userId: data.userId };
  });
}

export async function loginAction(
  _prev: ActionState<{ user: UserSummary }>,
  form: FormData,
): Promise<ActionState<{ user: UserSummary }>> {
  return runAction(async () => {
    const payload = {
      ...pickEmailOrPhone(form),
      password: requireString(form, "password"),
    };
    const data = await apiFetchWithCookieSync<{ user: UserSummary }>(
      "/auth/login",
      { method: "POST", body: payload },
    );
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}`, "layout");
    }
    return data;
  });
}

export async function loginWithOtpAction(
  _prev: ActionState<{ user: UserSummary }>,
  form: FormData,
): Promise<ActionState<{ user: UserSummary }>> {
  return runAction(async () => {
    const payload = {
      ...pickEmailOrPhone(form),
      code: requireString(form, "code"),
      purpose: (pickString(form, "purpose") as "login" | "forgot-password") ?? "login",
    };
    const data = await apiFetchWithCookieSync<{ user: UserSummary }>(
      "/auth/login-with-otp",
      { method: "POST", body: payload },
    );
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}`, "layout");
    }
    return data;
  });
}

export async function generateOtpAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    await apiFetchWithCookieSync<{ message: string }>("/auth/generate-otp", {
      method: "POST",
      body: {
        ...pickEmailOrPhone(form),
        purpose: requireString(form, "purpose"),
      },
    });
    return undefined;
  });
}

export async function verifyOtpAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    await apiFetchWithCookieSync<{ message: string }>("/auth/verify-otp", {
      method: "POST",
      body: {
        ...pickEmailOrPhone(form),
        code: requireString(form, "code"),
        purpose: pickString(form, "purpose") ?? "register",
      },
    });
    return undefined;
  });
}

export async function resetPasswordAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    await apiFetchWithCookieSync<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: {
        ...pickEmailOrPhone(form),
        newPassword: requireString(form, "newPassword"),
      },
    });
    return undefined;
  });
}

export async function googleCompleteAction(
  _prev: ActionState<{ user: UserSummary }>,
  form: FormData,
): Promise<ActionState<{ user: UserSummary }>> {
  return runAction(async () => {
    const data = await apiFetchWithCookieSync<{ user: UserSummary }>(
      "/auth/google-complete",
      {
        method: "POST",
        body: {
          tempToken: requireString(form, "tempToken"),
          role: requireString(form, "role"),
        },
      },
    );
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}`, "layout");
    }
    return data;
  });
}

export async function deleteAccountAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const result = await runAction(async () => {
    await apiFetchWithCookieSync<{ message: string }>("/auth/account", {
      method: "DELETE",
      body: { password: pickString(form, "password") ?? "" },
    });
    return undefined;
  });
  if (result.status === "success") {
    const store = await cookies();
    store.delete("token");
  }
  return result;
}

export async function logoutAction(): Promise<never> {
  const store = await cookies();
  store.delete("token");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`, "layout");
  }
  return redirectLocal("/");
}
