import { apiFetch } from "@/lib/api/client";
import type { Profile, ProfileMe } from "./types";

export interface UpdateProfileInput {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  username?: string;
  locale?: string;
  /** E.164-style, e.g. +919884259035 */
  whatsapp?: string | null;
}

export const profileService = {
  /** Full account view: user + profile + KYC summary. Requires auth. */
  getMyAccount: () => apiFetch<ProfileMe>("/profile"),

  updateProfile: (payload: UpdateProfileInput) =>
    apiFetch<{ profile: Profile }>("/profile", {
      method: "PATCH",
      body: payload as unknown as Record<string, unknown>,
    }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file, file.name);
    return apiFetch<{ profile: Profile }>("/profile/avatar", {
      method: "POST",
      body: fd,
    });
  },

  getPublicProfile: (userId: string) =>
    apiFetch<{ profile: Profile }>(`/profile/${userId}`),
};
