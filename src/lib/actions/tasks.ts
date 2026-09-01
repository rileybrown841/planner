"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { quickTaskSchema, stepSchema, taskSchema } from "@/lib/schemas";
import { STATUSES } from "@/lib/priority";
import { failed, invalid, succeeded, type ActionResult } from "@/lib/form";
import type { TaskStatus } from "@/lib/types";

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

function rawTask(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    due_at: formData.get("due_at") ?? "",
    priority: formData.get("priority") ?? "medium",
    status: formData.get("status") ?? "todo",
    link: formData.get("link") ?? undefined,
  };
}

export async function createTaskQuick(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = quickTaskSchema.safeParse({
    title: formData.get("title"),
    due_at: formData.get("due_at") ?? "",
    priority: formData.get("priority") ?? "medium",
    link: formData.get("link") ?? undefined,
  });
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title: parsed.data.title,
    due_date: parsed.data.due_at,
    priority: parsed.data.priority,
    class_id: parsed.data.link.class_id,
    extracurricular_id: parsed.data.link.extracurricular_id,
  });
  if (error) return failed(error.message);

  revalidateTaskViews();
  return succeeded("Task added.");
}

export async function createTask(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = taskSchema.safeParse(rawTask(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    due_date: parsed.data.due_at,
    priority: parsed.data.priority,
    status: parsed.data.status,
    class_id: parsed.data.link.class_id,
    extracurricular_id: parsed.data.link.extracurricular_id,
  });
  if (error) return failed(error.message);

  revalidateTaskViews();
  redirect("/tasks");
}

export async function updateTask(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = taskSchema.safeParse(rawTask(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      due_date: parsed.data.due_at,
      priority: parsed.data.priority,
      status: parsed.data.status,
      class_id: parsed.data.link.class_id,
      extracurricular_id: parsed.data.link.extracurricular_id,
      completed_at: parsed.data.status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateTaskViews();
  redirect(`/tasks/${id}`);
}

/** Set status from the list checkbox or the detail-page selector. */
export async function setTaskStatus(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;
  if (!id || !STATUSES.includes(status)) {
    redirect("/tasks?error=bad_request");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) redirect(`/tasks?error=${encodeURIComponent(error.message)}`);

  revalidateTaskViews();
}

export async function deleteTask(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/tasks?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) redirect(`/tasks?error=${encodeURIComponent(error.message)}`);

  revalidateTaskViews();
  redirect("/tasks");
}

/**
 * Add a checklist step. `parent` is `"task:<id>"` or `"assessment:<id>"`; the new
 * task links to that parent and inherits its class / activity. Stays on the page
 * (returns a result for the inline adder).
 */
export async function addStep(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = stepSchema.safeParse({
    title: formData.get("title"),
    due_at: formData.get("due_at") ?? "",
  });
  if (!parsed.success) return invalid(parsed.error);

  const [kind, parentId] = String(formData.get("parent") ?? "").split(":");
  if ((kind !== "task" && kind !== "assessment") || !parentId) {
    return failed("Couldn't work out what to attach this step to.");
  }

  const supabase = await createClient();
  const parentAssessmentId = kind === "assessment" ? parentId : null;
  const parentTaskId = kind === "task" ? parentId : null;

  let inheritedClassId: string | null = null;
  let inheritedActivityId: string | null = null;

  if (kind === "assessment") {
    const { data, error } = await supabase
      .from("assessments")
      .select("class_id")
      .eq("id", parentId)
      .maybeSingle();
    if (error) return failed(error.message);
    if (!data) return failed("That exam or project no longer exists.");
    inheritedClassId = data.class_id ?? null;
  } else {
    const { data, error } = await supabase
      .from("tasks")
      .select("class_id, extracurricular_id")
      .eq("id", parentId)
      .maybeSingle();
    if (error) return failed(error.message);
    if (!data) return failed("That task no longer exists.");
    inheritedClassId = data.class_id ?? null;
    inheritedActivityId = data.extracurricular_id ?? null;
  }

  const { error } = await supabase.from("tasks").insert({
    title: parsed.data.title,
    due_date: parsed.data.due_at,
    assessment_id: parentAssessmentId,
    parent_task_id: parentTaskId,
    class_id: inheritedClassId,
    extracurricular_id: inheritedActivityId,
  });
  if (error) return failed(error.message);

  revalidateTaskViews();
  if (parentTaskId) revalidatePath(`/tasks/${parentTaskId}`);
  if (parentAssessmentId) revalidatePath(`/exams/${parentAssessmentId}`);
  return succeeded("Step added.");
}
