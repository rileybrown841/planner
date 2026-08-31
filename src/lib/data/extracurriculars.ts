import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Extracurricular } from "@/lib/types";

export const listExtracurriculars = cache(async (): Promise<Extracurricular[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extracurriculars")
    .select("*")
    .order("name", { ascending: true })
    .returns<Extracurricular[]>();

  if (error) throw error;
  return data ?? [];
});

export const getExtracurricular = cache(
  async (id: string): Promise<Extracurricular | null> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("extracurriculars")
      .select("*")
      .eq("id", id)
      .maybeSingle<Extracurricular>();

    if (error) throw error;
    return data ?? null;
  },
);

/** Map of extracurricular_id -> number of linked tasks. */
export const taskCountsByExtracurricular = cache(
  async (): Promise<Record<string, number>> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("extracurricular_id")
      .not("extracurricular_id", "is", null);
    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.extracurricular_id) {
        counts[row.extracurricular_id] = (counts[row.extracurricular_id] ?? 0) + 1;
      }
    }
    return counts;
  },
);
