"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { quickTaskSchema, taskSchema } from "@/lib/schemas";
import { STATUSES } from "@/lib/priority";
import { failed, invalid, succeeded, type ActionResult } from "@/lib/form";
import type { TaskStatus } from "@/lib/types";

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/today");
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
