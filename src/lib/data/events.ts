import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { EventWithLinks } from "@/lib/types";

const LINK_SELECT =
  "*, class:classes(id,name,color), extracurricular:extracurriculars(id,name,color,type)";

export const listEvents = cache(async (): Promise<EventWithLinks[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(LINK_SELECT)
    .order("starts_at", { ascending: true })
    .returns<EventWithLinks[]>();

  if (error) throw error;
  return data ?? [];
});

export const getEvent = cache(async (id: string): Promise<EventWithLinks | null> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(LINK_SELECT)
    .eq("id", id)
    .maybeSingle<EventWithLinks>();

  if (error) throw error;
  return data ?? null;
});
