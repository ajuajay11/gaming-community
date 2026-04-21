import {
  Boxes,
  Gamepad2,
  Gem,
  Package,
  Rocket,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import type { GameCategory } from "@/services/types";

/**
 * Shared by the server `/explore` page and the client `CategoryTabs`
 * component. Kept as a plain `.ts` module (no `"use client"`) so both
 * runtimes can import the array directly without Next.js turning it into
 * a client-module reference proxy.
 */

export type CategoryKey = "all" | GameCategory;

export interface CategoryTab {
  key: CategoryKey;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_TABS: CategoryTab[] = [
  { key: "all", label: "All", icon: Boxes },
  { key: "account", label: "Accounts", icon: UserCircle2 },
  { key: "skin", label: "Skins", icon: Gem },
  { key: "currency", label: "Currency", icon: Package },
  { key: "item", label: "Items", icon: Gamepad2 },
  { key: "boosting", label: "Boosting", icon: Rocket },
];

export function labelForCategory(key: CategoryKey): string {
  return CATEGORY_TABS.find((t) => t.key === key)?.label ?? "All";
}
