import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { getCalendarSources, type CalendarSources } from "@/lib/data/calendar";
import { countOpenTasks } from "@/lib/data/tasks";

export type DashboardData = {
  sources: CalendarSources;
  openTaskCount: number;
};

/**
 * Everything `/today` needs. `getCalendarSources` already covers the active
 * semester, open dated tasks and open dated assessments; the client computes the
 * "due today" / "next exam" / schedule / coming-up views from it.
 */
export const getDashboardData = cache(async (): Promise<DashboardData> => {
  await requireUser();
  const [sources, openTaskCount] = await Promise.all([
    getCalendarSources(),
    countOpenTasks(),
  ]);
  return { sources, openTaskCount };
});
