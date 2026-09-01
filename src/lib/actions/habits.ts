"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { habitSchema, logHabitSchema } from "@/lib/schemas";
import { failed, invalid, type ActionResult } from "@/lib/form";
import { habitHref } from "@/lib/routes";

function revalidateHabitViews() {
  revalidatePath("/habits");
  revalidatePath("/today");
}

function rawHabit(formData: FormData) {
  const kind = String(formData.get("kind") ?? "counter");
  const isCounter = kind === "counter";
  return {
    name: formData.get("name"),
    kind,
    target: isCounter ? (formData.get("target") ?? "") : "",
    unit: isCounter ? (formData.get("unit") ?? undefined) : undefined,
    icon: formData.get("icon") ?? undefined,
    color: formData.get("color") ?? undefined,
  };
}

export async function createHabit(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = habitSchema.safeParse(rawHabit(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true });
  if (countError) return failed(countError.message);

  const { error } = await supabase.from("habits").insert({
    name: parsed.data.name,
    kind: parsed.data.kind,
    target: parsed.data.target,
    unit: parsed.data.unit,
    icon: parsed.data.icon,
    color: parsed.data.color,
    sort_order: count ?? 0,
  });
  if (error) return failed(error.message);

  revalidateHabitViews();
  redirect("/habits");
}

export async function updateHabit(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const parsed = habitSchema.safeParse(rawHabit(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      target: parsed.data.target,
      unit: parsed.data.unit,
      icon: parsed.data.icon,
      color: parsed.data.color,
    })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidateHabitViews();
  redirect(habitHref(id));
}

/** Toggle/delete actions — plain `<form action>`, bounce back with `?error=` on failure. */
async function mutate(formData: FormData, run: (supabase: Awaited<ReturnType<typeof createClient>>, id: string) => Promise<void>) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/habits?error=missing_id");

  const supabase = await createClient();
  try {
    await run(supabase, id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    redirect(`/habits?error=${encodeURIComponent(message)}`);
  }
  revalidateHabitViews();
}

export async function archiveHabit(formData: FormData) {
  await mutate(formData, async (supabase, id) => {
    const { error } = await supabase.from("habits").update({ is_archived: true }).eq("id", id);
    if (error) throw error;
  });
}

export async function unarchiveHabit(formData: FormData) {
  await mutate(formData, async (supabase, id) => {
    const { error } = await supabase.from("habits").update({ is_archived: false }).eq("id", id);
    if (error) throw error;
  });
}

export async function deleteHabit(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/habits?error=missing_id");

  const supabase = await createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) redirect(`/habits?error=${encodeURIComponent(error.message)}`);

  revalidateHabitViews();
  redirect("/habits");
}

/**
 * One quick-tap. `increment` / `decrement` adjust a counter for `date`
 * (hitting 0 removes the row); `toggle` checks a checklist habit on or off.
 * The client sends its own local `date`, so "today" is always the viewer's day.
 */
export async function logHabit(formData: FormData) {
  await requireUser();
  const parsed = logHabitSchema.safeParse({
    habit_id: formData.get("habit_id"),
    date: formData.get("date"),
    action: formData.get("action"),
  });
  if (!parsed.success) redirect("/habits?error=bad_request");
  const { habit_id, date, action } = parsed.data;

  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("habit_logs")
    .select("id, value")
    .eq("habit_id", habit_id)
    .eq("log_date", date)
    .maybeSingle<{ id: string; value: number }>();
  if (readError) redirect(`/habits?error=${encodeURIComponent(readError.message)}`);

  const bail = (error: { message: string } | null) => {
    if (error) redirect(`/habits?error=${encodeURIComponent(error.message)}`);
  };

  if (action === "toggle") {
    if (existing) {
      bail((await supabase.from("habit_logs").delete().eq("id", existing.id)).error);
    } else {
      bail((await supabase.from("habit_logs").insert({ habit_id, log_date: date, value: 1 })).error);
    }
  } else {
    const next = (existing?.value ?? 0) + (action === "increment" ? 1 : -1);
    if (next <= 0) {
      if (existing) bail((await supabase.from("habit_logs").delete().eq("id", existing.id)).error);
    } else if (existing) {
      bail((await supabase.from("habit_logs").update({ value: next }).eq("id", existing.id)).error);
    } else {
      bail((await supabase.from("habit_logs").insert({ habit_id, log_date: date, value: next })).error);
    }
  }

  revalidateHabitViews();
}
