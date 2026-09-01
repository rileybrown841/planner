/**
 * Expands calendar sources into concrete occurrences for a visible date range.
 * Pure + client-safe — the calendar view calls this whenever the range changes.
 */
import type { Route } from "next";
import type {
  AssessmentWithClass,
  CalendarItem,
  CalendarItemKind,
  Class,
  EventWithLinks,
  Extracurricular,
  Meeting,
  Semester,
  TaskWithLinks,
} from "@/lib/types";
import { eventStartDates, meetingDates } from "@/lib/recurrence";
import { activityHref, assessmentHref, classHref, eventHref, taskHref } from "@/lib/routes";

/** Standalone (unlinked) events + task due dates get these fallback colours. */
export const STANDALONE_EVENT_COLOR = "#8b5cf6"; // violet
export const TASK_COLOR = "#94a3b8"; // slate-400

export type CalendarSourceData = {
  activeSemester: Pick<Semester, "start_date" | "end_date"> | null;
  classes: Class[];
  activities: Extracurricular[];
  events: EventWithLinks[];
  tasks: TaskWithLinks[];
  assessments: AssessmentWithClass[];
};

function meetingItem(
  kind: CalendarItemKind,
  sourceId: string,
  title: string,
  color: string | null,
  location: string | null,
  meeting: Meeting,
  day: Date,
  href: Route,
): CalendarItem {
  const start = new Date(day);
  const [sh, sm] = meeting.start.split(":").map(Number);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(day);
  const [eh, em] = meeting.end.split(":").map(Number);
  end.setHours(eh, em, 0, 0);

  return {
    key: `${kind}:${sourceId}:${start.toISOString()}`,
    kind,
    sourceId,
    title,
    start,
    end,
    allDay: false,
    color,
    location,
    href,
  };
}

export function buildCalendarItems(
  sources: CalendarSourceData,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarItem[] {
  const items: CalendarItem[] = [];

  const clamp = sources.activeSemester
    ? { start: sources.activeSemester.start_date, end: sources.activeSemester.end_date }
    : undefined;

  for (const cls of sources.classes) {
    for (const m of cls.schedule ?? []) {
      for (const day of meetingDates(m, rangeStart, rangeEnd, clamp)) {
        items.push(
          meetingItem("class", cls.id, cls.name, cls.color, cls.location, m, day, classHref(cls.id)),
        );
      }
    }
  }

  for (const act of sources.activities) {
    for (const m of act.schedule ?? []) {
      for (const day of meetingDates(m, rangeStart, rangeEnd)) {
        items.push(
          meetingItem("activity", act.id, act.name, act.color, null, m, day, activityHref(act.id)),
        );
      }
    }
  }

  for (const ev of sources.events) {
    const startsAt = new Date(ev.starts_at);
    if (Number.isNaN(startsAt.getTime())) continue;
    const durationMs = ev.ends_at
      ? new Date(ev.ends_at).getTime() - startsAt.getTime()
      : 0;
    const color =
      ev.class?.color ?? ev.extracurricular?.color ?? STANDALONE_EVENT_COLOR;

    for (const occStart of eventStartDates(startsAt, ev.recurrence_rule, rangeStart, rangeEnd)) {
      const end =
        !ev.all_day && durationMs > 0
          ? new Date(occStart.getTime() + durationMs)
          : null;
      items.push({
        key: `event:${ev.id}:${occStart.toISOString()}`,
        kind: "event",
        sourceId: ev.id,
        title: ev.title,
        start: occStart,
        end,
        allDay: ev.all_day,
        color,
        location: ev.location,
        href: eventHref(ev.id),
      });
    }
  }

  for (const t of sources.tasks) {
    if (!t.due_date) continue;
    const due = new Date(t.due_date);
    if (Number.isNaN(due.getTime()) || due < rangeStart || due >= rangeEnd) continue;
    items.push({
      key: `task:${t.id}`,
      kind: "task",
      sourceId: t.id,
      title: t.title,
      start: due,
      end: null,
      allDay: true,
      color: t.class?.color ?? t.extracurricular?.color ?? TASK_COLOR,
      location: null,
      href: taskHref(t.id),
    });
  }

  for (const a of sources.assessments) {
    if (!a.due_date) continue;
    const due = new Date(a.due_date);
    if (Number.isNaN(due.getTime()) || due < rangeStart || due >= rangeEnd) continue;
    items.push({
      key: `assessment:${a.id}`,
      kind: "assessment",
      sourceId: a.id,
      title: `${a.kind === "exam" ? "Exam" : "Project"} · ${a.title}`,
      start: due,
      end: null,
      allDay: true,
      color: a.class?.color ?? STANDALONE_EVENT_COLOR,
      location: null,
      href: assessmentHref(a.id),
    });
  }

  return items.sort((a, b) => a.start.getTime() - b.start.getTime());
}
