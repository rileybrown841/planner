"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { extracurricularSchema } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";

function revalidateActivityViews() {
  revalidatePath("/extracurriculars");
  revalidatePath("/tasks");
  revalidatePath("/today");
}

/** Zip the repeated meeting-* fields, dropping blank rows (shared with classes). */
function readMeetings(formData: FormData) {
  const days = formData.getAll("meeting-day");
  const starts = formData.getAll("meeting-start");
  const ends = formData.getAll("meeting-end");
  const rows: { day: unknown; start: unknown; end: unknown }[] = [];
  for (let i = 0; i < days.length; i++) {
    if (!days[i] && !starts[i] && !ends[i]) continue;
    rows.push({ day: days[i], start: starts[i], end: ends[i] });
  }
  return rows;
}

function rawActivity(formData: FormData) {
  return {
    name: formData.get("name"),
    type: formData.get("type") ?? "other",
    color: formData.get("color") ?? undefined,
    schedule: readMeetings(formData),
  };
}

export async function createExtracurricular(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = extracurricularSchema.safeParse(rawActivity(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("extracurriculars").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
    schedule: parsed.data.schedule,
  });
  if (error) return failed(error.message);

  revalidateActivityViews();
  redirect("/extracurriculars");
}

export async function updateExtracurricular(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = extracurricularSchema.safeParse(rawActivity(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("extracurriculars")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      schedule: parsed.data.schedule,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateActivityViews();
  redirect(`/extracurriculars/${id}`);
}

export async function deleteExtracurricular(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/extracurriculars?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("extracurriculars").delete().eq("id", id);
  if (error) {
    redirect(`/extracurriculars?error=${encodeURIComponent(error.message)}`);
  }

  revalidateActivityViews();
  redirect("/extracurriculars");
}
