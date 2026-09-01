import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { TaskParentLink, TaskPriority, TaskWithLinks } from "@/lib/types";

const LINK_SELECT =
  "*, class:classes(id,name,color), extracurricular:extracurriculars(id,name,color,type), assessment:assessments(id,title,kind)";

export type TaskFilters = {
  classId?: string;
  activityId?: string;
  assessmentId?: string;
  parentId?: string;
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
    if (filters.assessmentId) query = query.eq("assessment_id", filters.assessmentId);
    if (filters.parentId) query = query.eq("parent_task_id", filters.parentId);
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

export type TaskDetail = TaskWithLinks & { parent: TaskParentLink | null };

export const getTask = cache(async (id: string): Promise<TaskDetail | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(LINK_SELECT)
    .eq("id", id)
    .maybeSingle<TaskWithLinks>();

  if (error) throw error;
  if (!data) return null;

  let parent: TaskParentLink | null = null;
  if (data.parent_task_id) {
    const { data: p } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("id", data.parent_task_id)
      .maybeSingle<TaskParentLink>();
    parent = p ?? null;
  }
  return { ...data, parent };
});

/** Steps of a task or an assessment (checklist, done included). */
export const listSteps = cache(
  async (filter: { parentId: string } | { assessmentId: string }): Promise<TaskWithLinks[]> => {
    return "parentId" in filter
      ? listTasks({ parentId: filter.parentId, includeDone: true })
      : listTasks({ assessmentId: filter.assessmentId, includeDone: true });
  },
);

/** Total tasks still to do (any due date, top-level or step). */
export const countOpenTasks = cache(async (): Promise<number> => {
  await requireUser();
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .neq("status", "done");

  if (error) throw error;
  return count ?? 0;
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
