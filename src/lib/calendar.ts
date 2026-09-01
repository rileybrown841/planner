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
import { addDays, fromDateKey, maxDate, minDate, startOfDay } from "@/lib/dates";
import { activityHref, assessmentHref, classHref, eventHref, taskHref } from "@/lib/routes";

/** Standalone (unlinked) events + task due dates get these fallback colours. */
export const STANDALONE_EVENT_COLOR = "#bd9ad6"; // lilac
export const TASK_COLOR = "#93a3ac"; // slate

export type CalendarSourceData = {
  activeSemester: Pick<Semester, "start_date" | "end_date" | "breaks"> | null;
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
  const breaks = sources.activeSemester?.breaks ?? [];

  for (const cls of sources.classes) {
    for (const m of cls.schedule ?? []) {
      for (const day of meetingDates(m, rangeStart, rangeEnd, clamp, breaks)) {
        items.push(
          meetingItem("class", cls.id, cls.name, cls.color, cls.location, m, day, classHref(cls.id)),
        );
      }
    }
  }

  // Break periods render as a labelled all-day chip on each day they cover.
  for (const br of breaks) {
    if (!br.start || !br.end) continue;
    let day = maxDate(startOfDay(fromDateKey(br.start)), rangeStart);
    const last = minDate(addDays(startOfDay(fromDateKey(br.end)), 1), rangeEnd);
    for (; day < last; day = addDays(day, 1)) {
      items.push({
        key: `break:${br.start}:${day.toISOString()}`,
        kind: "break",
        sourceId: br.start,
        title: br.name,
        start: new Date(day),
        end: null,
        allDay: true,
        color: null,
        location: null,
        href: "/calendar",
      });
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

    for (const occStart of eventStartDates(
      startsAt,
      ev.recurrence_rule,
      rangeStart,
      rangeEnd,
      ev.recurrence_until,
    )) {
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
