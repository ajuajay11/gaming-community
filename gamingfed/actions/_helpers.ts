import { ApiError } from "@/lib/api/types";

export type ActionState<T = undefined> =
  | { status: "idle" }
  | { status: "success"; message?: string; data?: T }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function runAction<T = undefined>(
  fn: () => Promise<T>,
): Promise<ActionState<T>> {
  try {
    const data = await fn();
    if (data === undefined) {
      return { status: "success" };
    }
    return { status: "success", data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { status: "error", message: err.message };
    }
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
}

export function pickString(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
}

export function requireString(form: FormData, key: string): string {
  const v = pickString(form, key);
  if (!v) throw new Error(`${key} is required`);
  return v;
}

export function pickNumber(form: FormData, key: string): number | undefined {
  const v = pickString(form, key);
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function pickBoolean(form: FormData, key: string): boolean | undefined {
  const v = form.get(key);
  if (v == null) return undefined;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return Boolean(v);
}

export function pickFiles(form: FormData, key: string): File[] {
  return form
    .getAll(key)
    .filter((v): v is File => v instanceof File && v.size > 0);
}

export function pickFile(form: FormData, key: string): File | undefined {
  const v = form.get(key);
  return v instanceof File && v.size > 0 ? v : undefined;
}
