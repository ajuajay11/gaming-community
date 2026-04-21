import { ApiError, type ApiEnvelope } from "./types";

const DEFAULT_BASE_URL = "http://localhost:5000/api";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
}

export interface ApiFetchInit extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: ApiFetchInit["query"]): string {
  const url = new URL(`${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Universal fetcher. Works in server components/actions (forwards incoming cookies
 * via next/headers) and in client components (uses credentials: "include").
 * Unwraps the API envelope and returns `data`. Throws `ApiError` on non-2xx or
 * `success: false` bodies.
 */
export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
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

  const isServer = typeof window === "undefined";
  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) requestHeaders.set("cookie", cookieHeader);
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    method: rest.method ?? (requestBody ? "POST" : "GET"),
    headers: requestHeaders,
    body: requestBody,
    credentials: isServer ? undefined : "include",
    cache: rest.cache ?? "no-store",
  });

  let envelope: ApiEnvelope<T> | undefined;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (redirects, 204, etc.)
  }

  if (!res.ok || envelope?.success === false) {
    if (!isServer && res.status === 401) {
      window.dispatchEvent(new CustomEvent("kerala-hub:unauthorized"));
    }
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${res.status}`,
      res.status,
      envelope?.errors,
    );
  }

  return envelope?.data as T;
}
