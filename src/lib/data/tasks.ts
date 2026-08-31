import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { TaskPriority, TaskWithLinks } from "@/lib/types";

const LINK_SELECT =
  "*, class:classes(id,name,color), extracurricular:extracurriculars(id,name,color,type)";

export type TaskFilters = {
  classId?: string;
  activityId?: string;
  priority?: TaskPriority;
  includeDone?: boolean;
};

export const listTasks = cache(
  async (filters: TaskFilters = {}): Promise<TaskWithLinks[]> => {
    await requireUser();
    const supabase = await createClient();

    let query = supabase.from("tasks").select(LINK_SELECT);

    if (!filters.includeDone) query = query.neq("status", "done");
    if (filters.classId) query = query.eq("class_id", filters.classId);
    if (filters.activityId) query = query.eq("extracurricular_id", filters.activityId);
    if (filters.priority) query = query.eq("priority", filters.priority);

    const { data, error } = await query
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<TaskWithLinks[]>();

    if (error) throw error;
    return data ?? [];
  },
);

export const getTask = cache(async (id: string): Promise<TaskWithLinks | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(LINK_SELECT)
    .eq("id", id)
    .maybeSingle<TaskWithLinks>();

  if (error) throw error;
  return data ?? null;
});

/** Open (not done) tasks that have a due date — the dashboard buckets these client-side. */
export const listOpenDatedTasks = cache(async (): Promise<TaskWithLinks[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(LINK_SELECT)
    .neq("status", "done")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .returns<TaskWithLinks[]>();

  if (error) throw error;
  return data ?? [];
});
