import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { getActiveSemester } from "@/lib/data/semesters";
import { listClasses } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { listEvents } from "@/lib/data/events";
import { listOpenDatedTasks } from "@/lib/data/tasks";
import { listOpenAssessments } from "@/lib/data/assessments";
import type {
  AssessmentWithClass,
  Class,
  EventWithLinks,
  Extracurricular,
  Semester,
  TaskWithLinks,
} from "@/lib/types";

export type CalendarSources = {
  activeSemester: Semester | null;
  classes: Class[];
  activities: Extracurricular[];
  events: EventWithLinks[];
  tasks: TaskWithLinks[];
  assessments: AssessmentWithClass[];
};

/**
 * Everything the calendar renders. Classes are limited to the active semester
 * (per project decision); activities, events, open dated tasks and open dated
 * assessments always show. The client expands recurrence for the visible range.
 */
export const getCalendarSources = cache(async (): Promise<CalendarSources> => {
  await requireUser();
  const activeSemester = await getActiveSemester();

  const [classes, activities, events, tasks, assessments] = await Promise.all([
    activeSemester ? listClasses(activeSemester.id) : Promise.resolve([]),
    listExtracurriculars(),
    listEvents(),
    listOpenDatedTasks(),
    listOpenAssessments(),
  ]);

  return { activeSemester, classes, activities, events, tasks, assessments };
});
