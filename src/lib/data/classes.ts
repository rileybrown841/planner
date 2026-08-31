import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Class, ClassWithSemester, Semester } from "@/lib/types";

export const listClasses = cache(
  async (semesterId: string): Promise<Class[]> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("semester_id", semesterId)
      .order("name", { ascending: true })
      .returns<Class[]>();

    if (error) throw error;
    return data ?? [];
  },
);

export type ClassPickerGroup = {
  semesterId: string;
  semesterName: string;
  isActive: boolean;
  classes: { id: string; name: string; color: string | null }[];
};

/**
 * Classes from every non-archived semester, grouped by semester (active first),
 * for the task link picker.
 */
export const listClassPickerOptions = cache(
  async (): Promise<ClassPickerGroup[]> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("semesters")
      .select("id, name, is_active, classes(id, name, color)")
      .eq("is_archived", false)
      .order("is_active", { ascending: false })
      .order("start_date", { ascending: false, nullsFirst: false })
      .returns<
        {
          id: string;
          name: string;
          is_active: boolean;
          classes: { id: string; name: string; color: string | null }[];
        }[]
      >();

    if (error) throw error;

    return (data ?? [])
      .map((s) => ({
        semesterId: s.id,
        semesterName: s.name,
        isActive: s.is_active,
        classes: [...s.classes].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter((g) => g.classes.length > 0);
  },
);

/** A class plus its parent semester (needed for the archived / read-only check). */
export const getClassWithSemester = cache(
  async (id: string): Promise<ClassWithSemester | null> => {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*, semester:semesters(*)")
      .eq("id", id)
      .maybeSingle<Class & { semester: Semester }>();

    if (error) throw error;
    if (!data?.semester) return null;
    return data as ClassWithSemester;
  },
);
