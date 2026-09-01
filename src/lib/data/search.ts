import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Route } from "next";
import {
  activityHref,
  assessmentHref,
  classHref,
  eventHref,
  habitHref,
  taskHref,
} from "@/lib/routes";

export type SearchEntry = {
  id: string;
  kind: "Task" | "Event" | "Exam / project" | "Class" | "Extracurricular" | "Habit";
  title: string;
  subtitle: string | null;
  href: Route;
};

/** Flat index for the ⌘K palette — client filters it by substring. */
export const getSearchIndex = cache(async (): Promise<SearchEntry[]> => {
  await requireUser();
  const supabase = await createClient();

  const [tasks, events, assessments, classes, activities, habits] = await Promise.all([
    supabase.from("tasks").select("id, title, status").order("created_at", { ascending: false }),
    supabase.from("events").select("id, title, starts_at").order("starts_at", { ascending: false }),
    supabase.from("assessments").select("id, title, kind").order("due_date", { ascending: true }),
    supabase.from("classes").select("id, name, code"),
    supabase.from("extracurriculars").select("id, name, type"),
    supabase.from("habits").select("id, name, kind, is_archived").order("sort_order", { ascending: true }),
  ]);

  const out: SearchEntry[] = [];

  for (const t of tasks.data ?? []) {
    out.push({
      id: t.id,
      kind: "Task",
      title: t.title,
      subtitle: t.status === "done" ? "done" : null,
      href: taskHref(t.id),
    });
  }
  for (const e of events.data ?? []) {
    out.push({ id: e.id, kind: "Event", title: e.title, subtitle: null, href: eventHref(e.id) });
  }
  for (const a of assessments.data ?? []) {
    out.push({
      id: a.id,
      kind: "Exam / project",
      title: a.title,
      subtitle: a.kind,
      href: assessmentHref(a.id),
    });
  }
  for (const c of classes.data ?? []) {
    out.push({
      id: c.id,
      kind: "Class",
      title: c.name,
      subtitle: c.code ?? null,
      href: classHref(c.id),
    });
  }
  for (const x of activities.data ?? []) {
    out.push({
      id: x.id,
      kind: "Extracurricular",
      title: x.name,
      subtitle: x.type,
      href: activityHref(x.id),
    });
  }
  for (const h of habits.data ?? []) {
    out.push({
      id: h.id,
      kind: "Habit",
      title: h.name,
      subtitle: h.is_archived ? "archived" : h.kind,
      href: habitHref(h.id),
    });
  }

  return out;
});
