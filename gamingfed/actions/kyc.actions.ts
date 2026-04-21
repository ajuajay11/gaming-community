"use server";

import { revalidatePath } from "next/cache";
import { apiFetchWithCookieSync } from "@/lib/api/server";
import type { KycRecord } from "@/services/types";
import {
  runAction,
  requireString,
  pickFile,
  type ActionState,
} from "./_helpers";

export async function submitKycAction(
  _prev: ActionState<{ kyc: KycRecord }>,
  form: FormData,
): Promise<ActionState<{ kyc: KycRecord }>> {
  return runAction(async () => {
    const outbound = new FormData();
    outbound.append("fullName", requireString(form, "fullName"));
    outbound.append("dateOfBirth", requireString(form, "dateOfBirth"));
    outbound.append("gender", requireString(form, "gender"));
    outbound.append("nationality", requireString(form, "nationality"));
    outbound.append("address", requireString(form, "address"));
    outbound.append("city", requireString(form, "city"));
    outbound.append("state", requireString(form, "state"));
    outbound.append("zipCode", requireString(form, "zipCode"));
    outbound.append("country", requireString(form, "country"));
    const profilePicture = pickFile(form, "profilePicture");
    if (profilePicture)
      outbound.append("profilePicture", profilePicture, profilePicture.name);

    const data = await apiFetchWithCookieSync<{ kyc: KycRecord }>("/kyc", {
      method: "POST",
      body: outbound,
    });
    revalidatePath("/profile");
    return data;
  });
}
