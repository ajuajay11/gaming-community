"use server";

import { revalidatePath } from "next/cache";
import { apiFetchWithCookieSync } from "@/lib/api/server";
import type { Profile } from "@/services/types";
import {
  runAction,
  pickString,
  type ActionState,
} from "./_helpers";

export async function updateProfileAction(
  _prev: ActionState<{ profile: Profile }>,
  form: FormData,
): Promise<ActionState<{ profile: Profile }>> {
  return runAction(async () => {
    const body: Record<string, unknown> = {};
    const displayName = pickString(form, "displayName");
    const bio = pickString(form, "bio");
    const avatarUrl = pickString(form, "avatarUrl");
    const username = pickString(form, "username");
    const locale = pickString(form, "locale");
    if (displayName !== undefined) body.displayName = displayName;
    if (bio !== undefined) body.bio = bio;
    if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;
    if (username !== undefined) body.username = username;
    if (locale !== undefined) body.locale = locale;

    const data = await apiFetchWithCookieSync<{ profile: Profile }>("/profile", {
      method: "PATCH",
      body,
    });
    revalidatePath("/profile");
    return data;
  });
}
