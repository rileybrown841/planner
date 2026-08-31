"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { classSchema } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";
import { NotFoundError, assertSemesterWritable, guardMessage } from "@/lib/data/guards";
import { classesHref } from "@/lib/routes";

function revalidateClassViews(semesterId: string) {
  revalidatePath("/classes");
  revalidatePath("/today");
  revalidatePath(`/semesters/${semesterId}`);
}

/** Zip the repeated meeting-* fields into rows, dropping any that are blank. */
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

function rawClass(formData: FormData) {
  return {
    name: formData.get("name"),
    code: formData.get("code") ?? undefined,
    instructor: formData.get("instructor") ?? undefined,
    location: formData.get("location") ?? undefined,
    color: formData.get("color") ?? undefined,
    schedule: readMeetings(formData),
  };
}

/** Convert a writability-guard failure into a form error; rethrow anything else. */
function guardError(e: unknown): ActionResult {
  const message = guardMessage(e);
  if (message) return failed(message);
  throw e;
}

export async function createClass(
  semesterId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = classSchema.safeParse(rawClass(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();

  let isActive = false;
  try {
    ({ isActive } = await assertSemesterWritable(supabase, semesterId));
  } catch (e) {
    return guardError(e);
  }

  const { error } = await supabase.from("classes").insert({
    semester_id: semesterId,
    name: parsed.data.name,
    code: parsed.data.code,
    instructor: parsed.data.instructor,
    location: parsed.data.location,
    color: parsed.data.color,
    schedule: parsed.data.schedule,
  });
  if (error) return failed(error.message);

  revalidateClassViews(semesterId);
  redirect(classesHref(semesterId, isActive));
}

export async function updateClass(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = classSchema.safeParse(rawClass(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("classes")
    .select("id, semester_id")
    .eq("id", id)
    .maybeSingle();
  if (readError) return failed(readError.message);
  if (!existing) return failed("That class no longer exists.");

  try {
    await assertSemesterWritable(supabase, existing.semester_id);
  } catch (e) {
    return guardError(e);
  }

  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      code: parsed.data.code,
      instructor: parsed.data.instructor,
      location: parsed.data.location,
      color: parsed.data.color,
      schedule: parsed.data.schedule,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateClassViews(existing.semester_id);
  redirect(`/classes/${id}`);
}

export async function deleteClass(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/classes?error=missing_id");

  const supabase = await createClient();
  let target: Route = "/classes";
  try {
    const { data: existing, error: readError } = await supabase
      .from("classes")
      .select("id, semester_id")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) throw new NotFoundError("That class no longer exists.");

    const { isActive } = await assertSemesterWritable(supabase, existing.semester_id);
    target = classesHref(existing.semester_id, isActive);

    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) throw error;

    revalidateClassViews(existing.semester_id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    redirect(`/classes?error=${encodeURIComponent(message)}`);
  }

  redirect(target);
}
