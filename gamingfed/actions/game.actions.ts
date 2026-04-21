"use server";

import { revalidatePath } from "next/cache";
import { apiFetchWithCookieSync } from "@/lib/api/server";
import type {
  GameCategory,
  GameDetails,
  ListingDoc,
  ListingStatus,
} from "@/services/types";
import {
  runAction,
  requireString,
  pickString,
  pickNumber,
  pickBoolean,
  pickFiles,
  type ActionState,
} from "./_helpers";

function pickDetails(form: FormData): GameDetails | undefined {
  const details: GameDetails = {};
  const platform = pickString(form, "details.platform") as GameDetails["platform"];
  const region = pickString(form, "details.region");
  const level = pickNumber(form, "details.level");
  const rank = pickString(form, "details.rank");
  const hoursPlayed = pickNumber(form, "details.hoursPlayed");
  if (platform) details.platform = platform;
  if (region !== undefined) details.region = region;
  if (level !== undefined) details.level = level;
  if (rank !== undefined) details.rank = rank;
  if (hoursPlayed !== undefined) details.hoursPlayed = hoursPlayed;
  return Object.keys(details).length ? details : undefined;
}

export async function uploadGameAction(
  _prev: ActionState<{ game: ListingDoc }>,
  form: FormData,
): Promise<ActionState<{ game: ListingDoc }>> {
  return runAction(async () => {
    const outbound = new FormData();
    outbound.append("title", requireString(form, "title"));
    const description = pickString(form, "description");
    if (description !== undefined) outbound.append("description", description);
    outbound.append("gameName", requireString(form, "gameName"));
    outbound.append("gameCategory", requireString(form, "gameCategory"));
    const priceAmount = pickNumber(form, "priceAmount");
    if (priceAmount == null) throw new Error("priceAmount is required");
    outbound.append("priceAmount", String(priceAmount));
    const currency = pickString(form, "currency");
    if (currency) outbound.append("currency", currency);
    const negotiable = pickBoolean(form, "negotiable");
    if (negotiable != null) outbound.append("negotiable", String(negotiable));
    const details = pickDetails(form);
    if (details) outbound.append("details", JSON.stringify(details));
    for (const file of pickFiles(form, "media")) outbound.append("media", file, file.name);

    const data = await apiFetchWithCookieSync<{ game: ListingDoc }>(
      "/game/upload-game",
      { method: "POST", body: outbound },
    );
    revalidatePath("/sell");
    revalidatePath("/buy");
    return data;
  });
}

export async function updateGameAction(
  _prev: ActionState<{ game: ListingDoc }>,
  form: FormData,
): Promise<ActionState<{ game: ListingDoc }>> {
  return runAction(async () => {
    const id = requireString(form, "id");
    const body: Record<string, unknown> = {};
    const title = pickString(form, "title");
    const description = pickString(form, "description");
    const gameName = pickString(form, "gameName");
    const gameCategory = pickString(form, "gameCategory") as GameCategory | undefined;
    const priceAmount = pickNumber(form, "priceAmount");
    const currency = pickString(form, "currency");
    const negotiable = pickBoolean(form, "negotiable");
    const status = pickString(form, "status") as ListingStatus | undefined;
    const details = pickDetails(form);
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (gameName !== undefined) body.gameName = gameName;
    if (gameCategory) body.gameCategory = gameCategory;
    if (priceAmount !== undefined) body.priceAmount = priceAmount;
    if (currency) body.currency = currency;
    if (negotiable !== undefined) body.negotiable = negotiable;
    if (status) body.status = status;
    if (details) body.details = details;

    const data = await apiFetchWithCookieSync<{ game: ListingDoc }>(
      `/game/update-game/${id}`,
      { method: "PUT", body },
    );
    revalidatePath(`/buy/${id}`);
    revalidatePath("/buy");
    return data;
  });
}

export async function deleteGameAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const id = requireString(form, "id");
    await apiFetchWithCookieSync<{ message: string }>(`/game/delete-game/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/buy");
    revalidatePath("/sell");
    return undefined;
  });
}

export async function purchaseGameAction(
  _prev: ActionState<{ message: string }>,
  form: FormData,
): Promise<ActionState<{ message: string }>> {
  return runAction(async () => {
    const id = requireString(form, "id");
    const data = await apiFetchWithCookieSync<{ message: string }>(
      `/game/purchase/${id}`,
      { method: "POST" },
    );
    revalidatePath(`/buy/${id}`);
    return data;
  });
}
