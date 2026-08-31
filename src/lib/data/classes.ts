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
