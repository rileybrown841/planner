import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { getCalendarSources, type CalendarSources } from "@/lib/data/calendar";
import { getHabitsData, type HabitsData } from "@/lib/data/habits";
import { countOpenTasks } from "@/lib/data/tasks";

export type DashboardData = {
  sources: CalendarSources;
  openTaskCount: number;
  habits: HabitsData;
};

/**
 * Everything `/today` needs. `getCalendarSources` already covers the active
 * semester, open dated tasks and open dated assessments; the client computes the
 * "due today" / "next exam" / schedule / coming-up / habit views from it.
 */
export const getDashboardData = cache(async (): Promise<DashboardData> => {
  await requireUser();
  const [sources, openTaskCount, habits] = await Promise.all([
    getCalendarSources(),
    countOpenTasks(),
    getHabitsData(),
  ]);
  return { sources, openTaskCount, habits };
});
