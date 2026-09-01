/**
 * Hand-written shapes for the rows we read from Supabase. The Supabase client
 * isn't generic-typed yet (no `supabase gen types`), so query helpers cast their
 * results to these via `.returns<T>()`.
 */
import type { Route } from "next";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type MeetingFreq = "weekly" | "biweekly" | "monthly";

export interface Meeting {
  day: DayKey;
  /** 24h "HH:MM" */
  start: string;
  /** 24h "HH:MM" */
  end: string;
  /** Absent ⇒ weekly. Classes are always weekly. */
  freq?: MeetingFreq;
  /** "YYYY-MM-DD" — a date the meeting occurs; required for biweekly/monthly. */
  anchor?: string | null;
}

/** @deprecated use `Meeting` */
export type ClassMeeting = Meeting;

/** A named no-class stretch (Spring Break, reading week…). Dates are inclusive. */
export interface SemesterBreak {
  name: string;
  /** "YYYY-MM-DD" */
  start: string;
  /** "YYYY-MM-DD" */
  end: string;
}

export interface Semester {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  /** No-class date ranges; class meetings are hidden on these days. */
  breaks: SemesterBreak[];
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  location: string | null;
  color: string | null;
  schedule: Meeting[];
  created_at: string;
  updated_at: string;
}

/** A class row joined with the parent semester (for the archived/read-only check). */
export interface ClassWithSemester extends Class {
  semester: Semester;
}

export type ActivityType = "club" | "job" | "sport" | "volunteer" | "other";

export interface Extracurricular {
  id: string;
  user_id: string;
  name: string;
  type: ActivityType;
  color: string | null;
  schedule: Meeting[];
  created_at: string;
  updated_at: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  class_id: string | null;
  extracurricular_id: string | null;
  assessment_id: string | null;
  parent_task_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AssessmentKind = "exam" | "project";

export interface Assessment {
  id: string;
  user_id: string;
  class_id: string | null;
  title: string;
  kind: AssessmentKind;
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Minimal shapes joined onto a task for display (colour chip + label). */
export type TaskClassLink = { id: string; name: string; color: string | null };
export type TaskActivityLink = TaskClassLink & { type: ActivityType };
export type TaskAssessmentLink = { id: string; title: string; kind: AssessmentKind };
export type TaskParentLink = { id: string; title: string };

export interface TaskWithLinks extends Task {
  class: TaskClassLink | null;
  extracurricular: TaskActivityLink | null;
  assessment: TaskAssessmentLink | null;
}

export interface AssessmentWithClass extends Assessment {
  class: TaskClassLink | null;
}

export interface EventRow {
  id: string;
  user_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  notes: string | null;
  /** null | "weekly" | "biweekly" | "monthly" — anchor is `starts_at`. */
  recurrence_rule: MeetingFreq | null;
  /** "YYYY-MM-DD" — last day a recurring occurrence may land on. null ⇒ forever. */
  recurrence_until: string | null;
  class_id: string | null;
  extracurricular_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithLinks extends EventRow {
  class: TaskClassLink | null;
  extracurricular: TaskActivityLink | null;
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------
export type CalendarItemKind =
  | "class"
  | "activity"
  | "event"
  | "task"
  | "assessment"
  | "break";

export interface CalendarItem {
  /** Stable per occurrence: `${kind}:${sourceId}:${startISO}`. */
  key: string;
  kind: CalendarItemKind;
  sourceId: string;
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  color: string | null;
  location: string | null;
  /** Where a click navigates (task/class/activity/event detail). */
  href: Route;
}
