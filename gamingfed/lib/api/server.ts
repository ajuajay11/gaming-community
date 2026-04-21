import "server-only";
import { cookies } from "next/headers";
import { apiFetch, getApiBaseUrl, type ApiFetchInit } from "./client";
import { ApiError, type ApiEnvelope } from "./types";

/**
 * Same as `apiFetch`, but also forwards `Set-Cookie` headers from the backend
 * response to the browser via `cookies().set()`. Use this in server actions
 * that need to persist auth/session cookies (login, register, logout, ...).
 */
export async function apiFetchWithCookieSync<T>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const { body, query, headers, ...rest } = init;

  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body && typeof body === "object") {
    requestHeaders.set("content-type", "application/json");
    requestBody = JSON.stringify(body);
  } else if (typeof body === "string") {
    requestBody = body;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) requestHeaders.set("cookie", cookieHeader);

  const url = new URL(`${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    ...rest,
    method: rest.method ?? (requestBody ? "POST" : "GET"),
    headers: requestHeaders,
    body: requestBody,
    cache: rest.cache ?? "no-store",
  });

  type SetCookieGetter = {
    getSetCookie?: () => string[];
    raw?: () => Record<string, string[]>;
  };
  const setCookieHeaders: string[] =
    (res.headers as unknown as SetCookieGetter).getSetCookie?.() ??
    (res.headers as unknown as SetCookieGetter).raw?.()?.["set-cookie"] ??
    [];

  for (const raw of setCookieHeaders) {
    const [pair, ...attrs] = raw.split(";").map((s) => s.trim());
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx);
    const value = pair.slice(eqIdx + 1);
    const opts: Parameters<typeof cookieStore.set>[2] = { path: "/" };
    for (const attr of attrs) {
      const [k, v] = attr.split("=");
      const lk = k.toLowerCase();
      if (lk === "max-age") opts.maxAge = Number(v);
      else if (lk === "expires") opts.expires = new Date(v);
      else if (lk === "path") opts.path = v || "/";
      else if (lk === "domain") opts.domain = v;
      else if (lk === "httponly") opts.httpOnly = true;
      else if (lk === "secure") opts.secure = true;
      else if (lk === "samesite")
        opts.sameSite = (v?.toLowerCase() as "lax" | "strict" | "none") ?? "lax";
    }
    cookieStore.set(name, decodeURIComponent(value), opts);
  }

  let envelope: ApiEnvelope<T> | undefined;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // ignore non-JSON
  }

  if (!res.ok || envelope?.success === false) {
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${res.status}`,
      res.status,
      envelope?.errors,
    );
  }

  return envelope?.data as T;
}

/** Re-export the standard server-safe fetcher for convenience. */
export { apiFetch };
