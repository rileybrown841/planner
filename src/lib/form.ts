import { z, type ZodError } from "zod";

/** Shared shape returned by every form Server Action via `useActionState`. */
export type ActionResult = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const IDLE_RESULT: ActionResult = { status: "idle" };

export function succeeded(message: string): ActionResult {
  return { status: "success", message };
}

export function fieldErrors(error: ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

export function invalid(
  error: ZodError,
  message = "Please fix the highlighted fields.",
): ActionResult {
  return { status: "error", message, fieldErrors: fieldErrors(error) };
}

export function failed(message: string): ActionResult {
  return { status: "error", message };
}

/** Read a text field, trimmed; `""` becomes `undefined`. */
export function text(formData: FormData, name: string): string | undefined {
  const v = formData.get(name);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}
