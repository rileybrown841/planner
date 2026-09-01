"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventValues } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";

function revalidateEventViews() {
  revalidatePath("/calendar");
  revalidatePath("/today");
}

function rawEvent(formData: FormData) {
  return {
    title: formData.get("title"),
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    all_day: formData.get("all_day") === "on",
    location: formData.get("location") ?? undefined,
    notes: formData.get("notes") ?? undefined,
    recurrence: formData.get("recurrence") ?? "",
    link: formData.get("link") ?? undefined,
  };
}

function toRow(data: EventValues) {
  return {
    title: data.title,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    all_day: data.all_day,
    location: data.location,
    notes: data.notes,
    recurrence_rule: data.recurrence,
    class_id: data.link.class_id,
    extracurricular_id: data.link.extracurricular_id,
  };
}

export async function createEvent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = eventSchema.safeParse(rawEvent(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert(toRow(parsed.data));
  if (error) return failed(error.message);

  revalidateEventViews();
  redirect("/calendar");
}

export async function updateEvent(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = eventSchema.safeParse(rawEvent(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(toRow(parsed.data)).eq("id", id);
  if (error) return failed(error.message);

  revalidateEventViews();
  redirect(`/events/${id}`);
}

export async function deleteEvent(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/calendar?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) redirect(`/calendar?error=${encodeURIComponent(error.message)}`);

  revalidateEventViews();
  redirect("/calendar");
}
