import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Semester } from "@/lib/types";

/**
 * All semesters, newest first, archived ones last. RLS scopes to the owner;
 * `requireUser()` guarantees there is one.
 */
export const listSemesters = cache(async (): Promise<Semester[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .order("is_archived", { ascending: true })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<Semester[]>();

  if (error) throw error;
  return data ?? [];
});

export const getActiveSemester = cache(async (): Promise<Semester | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .eq("is_active", true)
    .maybeSingle<Semester>();

  if (error) throw error;
  return data ?? null;
});

export const getSemester = cache(async (id: string): Promise<Semester | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", id)
    .maybeSingle<Semester>();

  if (error) throw error;
  return data ?? null;
});

/** Map of semester_id -> number of classes, for the semesters list. */
export const classCountsBySemester = cache(
  async (): Promise<Record<string, number>> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase.from("classes").select("semester_id");
    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.semester_id] = (counts[row.semester_id] ?? 0) + 1;
    }
    return counts;
  },
);
