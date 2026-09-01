import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Habit, HabitLog } from "@/lib/types";

/** All habits, active first, then by manual order / age. */
export const listHabits = cache(async (): Promise<Habit[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("is_archived", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Habit[]>();

  if (error) throw error;
  return data ?? [];
});

export const getHabit = cache(async (id: string): Promise<Habit | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .maybeSingle<Habit>();

  if (error) throw error;
  return data ?? null;
});

/**
 * Every habit log for the user. The table stays small for a single user (≈one
 * row per habit per day), and streak / history maths run client-side against
 * the viewer's local calendar, so we hand over the whole set.
 */
export const listHabitLogs = cache(async (): Promise<HabitLog[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .order("log_date", { ascending: false })
    .returns<HabitLog[]>();

  if (error) throw error;
  return data ?? [];
});

export type HabitsData = { habits: Habit[]; logs: HabitLog[] };

/** Habits + all their logs — for the /habits page and the dashboard panel. */
export const getHabitsData = cache(async (): Promise<HabitsData> => {
  await requireUser();
  const [habits, logs] = await Promise.all([listHabits(), listHabitLogs()]);
  return { habits, logs };
});
