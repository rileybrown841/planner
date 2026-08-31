"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { semesterSchema } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";
import { assertSemesterWritable, guardMessage } from "@/lib/data/guards";

function revalidateSemesterViews() {
  revalidatePath("/semesters");
  revalidatePath("/classes");
  revalidatePath("/today");
}

function rawSemester(formData: FormData) {
  return {
    name: formData.get("name"),
    start_date: formData.get("start_date") ?? "",
    end_date: formData.get("end_date") ?? "",
  };
}

export async function createSemester(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = semesterSchema.safeParse(rawSemester(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("semesters")
    .select("id", { count: "exact", head: true });
  if (countError) return failed(countError.message);

  const { error } = await supabase.from("semesters").insert({
    name: parsed.data.name,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    is_active: (count ?? 0) === 0, // first semester becomes the active one
  });
  if (error) return failed(error.message);

  revalidateSemesterViews();
  redirect("/semesters");
}

export async function updateSemester(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = semesterSchema.safeParse(rawSemester(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  try {
    await assertSemesterWritable(supabase, id);
  } catch (e) {
    const message = guardMessage(e);
    if (message) return failed(message);
    throw e;
  }

  const { error } = await supabase
    .from("semesters")
    .update({
      name: parsed.data.name,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateSemesterViews();
  redirect("/semesters");
}

/** Simple toggle actions — used with plain <form action>. Bounce back on error. */
async function toggle(
  formData: FormData,
  apply: (
    supabase: Awaited<ReturnType<typeof createClient>>,
    id: string,
  ) => Promise<void>,
) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/semesters?error=missing_id");

  const supabase = await createClient();
  try {
    await apply(supabase, id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    redirect(`/semesters?error=${encodeURIComponent(message)}`);
  }
  revalidateSemesterViews();
}

export async function activateSemester(formData: FormData) {
  await toggle(formData, async (supabase, id) => {
    await assertSemesterWritable(supabase, id); // can't activate an archived one
    const clear = await supabase
      .from("semesters")
      .update({ is_active: false })
      .eq("is_active", true);
    if (clear.error) throw clear.error;
    const set = await supabase
      .from("semesters")
      .update({ is_active: true })
      .eq("id", id);
    if (set.error) throw set.error;
  });
}

export async function archiveSemester(formData: FormData) {
  await toggle(formData, async (supabase, id) => {
    const { error } = await supabase
      .from("semesters")
      .update({ is_archived: true, is_active: false })
      .eq("id", id);
    if (error) throw error;
  });
}

export async function unarchiveSemester(formData: FormData) {
  await toggle(formData, async (supabase, id) => {
    const { error } = await supabase
      .from("semesters")
      .update({ is_archived: false })
      .eq("id", id);
    if (error) throw error;
  });
}

export async function deleteSemester(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/semesters?error=missing_id");

  const supabase = await createClient();
  try {
    await assertSemesterWritable(supabase, id); // archived semesters can't be deleted
    const { error } = await supabase.from("semesters").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    redirect(`/semesters?error=${encodeURIComponent(message)}`);
  }

  revalidateSemesterViews();
  redirect("/semesters");
}
