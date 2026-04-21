import { apiFetch } from "@/lib/api/client";
import type { AchievementDefinition, UserAchievement } from "./types";

export const achievementService = {
  getDefinitions: () =>
    apiFetch<{ definitions: AchievementDefinition[] }>("/achievements/definitions"),

  getMyAchievements: () =>
    apiFetch<{ achievements: UserAchievement[] }>("/achievements/me"),
};
