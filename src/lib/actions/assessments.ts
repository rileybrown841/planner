"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { assessmentSchema } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";

function revalidateAssessmentViews(id?: string) {
  revalidatePath("/exams");
  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath("/tasks");
  if (id) revalidatePath(`/exams/${id}`);
}

function rawAssessment(formData: FormData) {
  return {
    title: formData.get("title"),
    kind: formData.get("kind") ?? "exam",
    class_id: formData.get("class_id") ?? "",
    due_at: formData.get("due_at") ?? "",
    notes: formData.get("notes") ?? undefined,
  };
}

export async function createAssessment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = assessmentSchema.safeParse(rawAssessment(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("assessments").insert({
    title: parsed.data.title,
    kind: parsed.data.kind,
    class_id: parsed.data.class_id,
    due_date: parsed.data.due_at,
    notes: parsed.data.notes,
  });
  if (error) return failed(error.message);

  revalidateAssessmentViews();
  redirect("/exams");
}

export async function updateAssessment(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = assessmentSchema.safeParse(rawAssessment(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("assessments")
    .update({
      title: parsed.data.title,
      kind: parsed.data.kind,
      class_id: parsed.data.class_id,
      due_date: parsed.data.due_at,
      notes: parsed.data.notes,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateAssessmentViews(id);
  redirect(`/exams/${id}`);
}

export async function toggleAssessmentDone(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const done = formData.get("done") === "true";
  if (!id) redirect("/exams?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("assessments")
    .update({ completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) redirect(`/exams?error=${encodeURIComponent(error.message)}`);

  revalidateAssessmentViews(id);
}

export async function deleteAssessment(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/exams?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) redirect(`/exams?error=${encodeURIComponent(error.message)}`);

  revalidateAssessmentViews();
  redirect("/exams");
}
