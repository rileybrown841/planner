"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cancelOccurrenceSchema } from "@/lib/schemas";
import { failed, invalid, succeeded, type ActionResult } from "@/lib/form";

const TABLE = {
  class: "classes",
  activity: "extracurriculars",
  event: "events",
} as const;

/**
 * "Delete this one occurrence" from the calendar. A one-off event has a single
 * occurrence, so it's deleted outright; every recurring source instead records
 * the date in its `skip_dates` jsonb (which `buildCalendarItems` filters out).
 */
export async function cancelOccurrence(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();

  const parsed = cancelOccurrenceSchema.safeParse({
    kind: formData.get("kind"),
    id: formData.get("id"),
    date: formData.get("date"),
  });
  if (!parsed.success) return invalid(parsed.error);
  const { kind, id, date } = parsed.data;

  const supabase = await createClient();
  const table = TABLE[kind];

  if (kind === "event") {
    const { data: event, error: readError } = await supabase
      .from("events")
      .select("recurrence_rule, skip_dates")
      .eq("id", id)
      .maybeSingle<{ recurrence_rule: string | null; skip_dates: string[] | null }>();
    if (readError) return failed(readError.message);
    if (!event) return failed("That event no longer exists.");

    if (!event.recurrence_rule) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) return failed(error.message);
      revalidateCalendarViews();
      return succeeded("Event deleted.");
    }

    const next = addDate(event.skip_dates, date);
    const { error } = await supabase.from("events").update({ skip_dates: next }).eq("id", id);
    if (error) return failed(error.message);
    revalidateCalendarViews();
    return succeeded("Occurrence removed.");
  }

  const { data: row, error: readError } = await supabase
    .from(table)
    .select("skip_dates")
    .eq("id", id)
    .maybeSingle<{ skip_dates: string[] | null }>();
  if (readError) return failed(readError.message);
  if (!row) return failed("That item no longer exists.");

  const next = addDate(row.skip_dates, date);
  const { error } = await supabase.from(table).update({ skip_dates: next }).eq("id", id);
  if (error) return failed(error.message);

  revalidateCalendarViews();
  return succeeded("Occurrence removed.");
}

function addDate(current: string[] | null, date: string): string[] {
  const set = new Set(current ?? []);
  set.add(date);
  return [...set];
}

function revalidateCalendarViews() {
  revalidatePath("/calendar");
  revalidatePath("/today");
}
