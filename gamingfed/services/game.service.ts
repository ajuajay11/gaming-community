import { apiFetch } from "@/lib/api/client";
import type {
  GameCatalogEntry,
  GameCategory,
  GameDetails,
  GameListing,
  ListingDoc,
  ListingStatus,
} from "./types";

export interface GameUploadInput {
  title: string;
  description?: string | null;
  gameName: string;
  gameCategory: GameCategory;
  priceAmount: number;
  currency?: string;
  negotiable?: boolean;
  details?: GameDetails;
  media: File[];
}

export interface GameListQuery {
  status?: ListingStatus;
  gameCategory?: GameCategory;
  gameName?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

export interface GameListResponse {
  games: ListingDoc[];
  page: number;
  limit: number;
  total: number;
}

export interface GameCatalogQuery {
  limit?: number;
  search?: string;
}

export interface GameUpdateInput {
  title?: string;
  description?: string | null;
  gameName?: string;
  gameCategory?: GameCategory;
  priceAmount?: number;
  currency?: string;
  negotiable?: boolean;
  status?: ListingStatus;
  details?: GameDetails;
}

/** New uploads + blob keys to remove (server must own the key). */
export interface GameUpdateMedia {
  newFiles: File[];
  removedKeys: string[];
}

function toFormData(input: GameUploadInput): FormData {
  const fd = new FormData();
  fd.append("title", input.title);
  if (input.description != null) fd.append("description", input.description);
  fd.append("gameName", input.gameName);
  fd.append("gameCategory", input.gameCategory);
  fd.append("priceAmount", String(input.priceAmount));
  if (input.currency) fd.append("currency", input.currency);
  if (input.negotiable != null) fd.append("negotiable", String(input.negotiable));
  if (input.details) fd.append("details", JSON.stringify(input.details));
  for (const file of input.media) fd.append("media", file, file.name);
  return fd;
}

function toUpdateFormData(input: GameUpdateInput, media: GameUpdateMedia): FormData {
  const fd = new FormData();
  if (input.title != null) fd.append("title", input.title);
  if (input.description != null) fd.append("description", input.description);
  if (input.gameName != null) fd.append("gameName", input.gameName);
  if (input.gameCategory != null) fd.append("gameCategory", input.gameCategory);
  if (input.priceAmount != null) fd.append("priceAmount", String(input.priceAmount));
  if (input.currency != null) fd.append("currency", input.currency);
  if (input.negotiable != null) fd.append("negotiable", String(input.negotiable));
  if (input.status != null) fd.append("status", input.status);
  if (input.details) fd.append("details", JSON.stringify(input.details));
  if (media.removedKeys.length) {
    fd.append("removedImageKeys", JSON.stringify(media.removedKeys));
  }
  for (const file of media.newFiles) {
    fd.append("media", file, file.name);
  }
  return fd;
}

export interface MyListingsQuery {
  status?: ListingStatus;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

type QueryRecord = Record<
  string,
  string | number | boolean | undefined | null
>;

const q = (params: object): QueryRecord => params as QueryRecord;

export const gameService = {
  uploadGame: (input: GameUploadInput) =>
    apiFetch<{ game: ListingDoc }>("/game/upload-game", {
      method: "POST",
      body: toFormData(input),
    }),

  getGames: (query: GameListQuery = {}) =>
    apiFetch<GameListResponse>("/game/get-games", { query: q(query) }),

  getGame: (id: string) =>
    apiFetch<{ game: ListingDoc }>(`/game/get-game/${id}`),

  getCatalog: (query: GameCatalogQuery = {}) =>
    apiFetch<{ games: GameCatalogEntry[] }>("/game/catalog", { query: q(query) }),

  getTrending: (query: GameCatalogQuery = {}) =>
    apiFetch<{ games: GameCatalogEntry[] }>("/game/trending", { query: q(query) }),

  /** Seller dashboard — all own listings across every status. Requires auth. */
  getMyListings: (query: MyListingsQuery = {}) =>
    apiFetch<GameListResponse>("/game/my-listings", { query: q(query) }),

  /** Buyer history — purchased listings only. Requires auth. */
  getMyPurchases: (query: MyListingsQuery = {}) =>
    apiFetch<GameListResponse>("/game/my-purchases", { query: q(query) }),

  updateGame: (id: string, input: GameUpdateInput, media?: GameUpdateMedia) => {
    const m = media ?? { newFiles: [], removedKeys: [] };
    const useMultipart = m.newFiles.length > 0 || m.removedKeys.length > 0;
    if (useMultipart) {
      return apiFetch<{ game: ListingDoc }>(`/game/update-game/${id}`, {
        method: "PUT",
        body: toUpdateFormData(input, m),
      });
    }
    return apiFetch<{ game: ListingDoc }>(`/game/update-game/${id}`, {
      method: "PUT",
      body: input as unknown as Record<string, unknown>,
    });
  },

  deleteGame: (id: string) =>
    apiFetch<{ message: string }>(`/game/delete-game/${id}`, {
      method: "DELETE",
    }),

  purchaseListing: (id: string) =>
    apiFetch<{ message: string; game?: ListingDoc }>(`/game/purchase/${id}`, {
      method: "POST",
    }),
};
