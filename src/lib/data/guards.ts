import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Thrown by mutations that touch an archived (read-only) semester. */
export class ArchivedError extends Error {
  constructor(message = "This semester is archived and read-only. Unarchive it to make changes.") {
    super(message);
    this.name = "ArchivedError";
  }
}

/** Thrown when a row doesn't exist or isn't owned by the current user. */
export class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** `e.message` if `e` is an expected guard failure, else `null` (caller should rethrow). */
export function guardMessage(e: unknown): string | null {
  return e instanceof ArchivedError || e instanceof NotFoundError ? e.message : null;
}

/**
 * Guarantees the semester exists, is owned by the caller (RLS), and is not
 * archived. Call at the top of every semester/class mutation. Returns the
 * semester's `is_active` flag so callers can pick a redirect target.
 */
export async function assertSemesterWritable(
  supabase: SupabaseClient,
  semesterId: string,
): Promise<{ isActive: boolean }> {
  const { data, error } = await supabase
    .from("semesters")
    .select("id, is_archived, is_active")
    .eq("id", semesterId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("That semester no longer exists.");
  if (data.is_archived) throw new ArchivedError();
  return { isActive: data.is_active };
}
