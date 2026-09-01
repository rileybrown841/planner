import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { AssessmentWithClass } from "@/lib/types";

const CLASS_SELECT = "*, class:classes(id,name,color)";

export const listAssessments = cache(async (): Promise<AssessmentWithClass[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(CLASS_SELECT)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<AssessmentWithClass[]>();

  if (error) throw error;
  return data ?? [];
});

export const getAssessment = cache(
  async (id: string): Promise<AssessmentWithClass | null> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessments")
      .select(CLASS_SELECT)
      .eq("id", id)
      .maybeSingle<AssessmentWithClass>();

    if (error) throw error;
    return data ?? null;
  },
);

export type StepCount = { total: number; done: number };

/** Map of assessment_id -> step progress, for the /exams list. */
export const assessmentStepCounts = cache(
  async (): Promise<Record<string, StepCount>> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("assessment_id, status")
      .not("assessment_id", "is", null);
    if (error) throw error;

    const counts: Record<string, StepCount> = {};
    for (const row of data ?? []) {
      if (!row.assessment_id) continue;
      const c = (counts[row.assessment_id] ??= { total: 0, done: 0 });
      c.total += 1;
      if (row.status === "done") c.done += 1;
    }
    return counts;
  },
);

/** Not-done assessments with a due date — for the dashboard + calendar. */
export const listOpenAssessments = cache(async (): Promise<AssessmentWithClass[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(CLASS_SELECT)
    .is("completed_at", null)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .returns<AssessmentWithClass[]>();

  if (error) throw error;
  return data ?? [];
});
