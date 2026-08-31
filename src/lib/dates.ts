/**
 * Client-side date helpers for task triage. All bucket/relative math runs in the
 * viewer's local timezone (the server never stores or guesses a timezone), so
 * these are safe to call in Client Components with `new Date()`.
 */

export type DueBucket = "overdue" | "today" | "week" | "later" | "someday";

export const BUCKET_LABEL: Record<DueBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  week: "This week",
  later: "Later",
  someday: "Someday",
};

export const BUCKET_ORDER: DueBucket[] = ["overdue", "today", "week", "later", "someday"];

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Which triage bucket a due date falls into, relative to `now`. */
export function bucketFor(due: string | null, now: Date = new Date()): DueBucket {
  if (!due) return "someday";
  const dueDate = new Date(due);
  if (Number.isNaN(dueDate.getTime())) return "someday";

  if (dueDate.getTime() < now.getTime()) return "overdue";

  const todayEnd = addDays(startOfDay(now), 1);
  if (dueDate < todayEnd) return "today";

  const weekEnd = addDays(startOfDay(now), 7);
  if (dueDate < weekEnd) return "week";

  return "later";
}

const DAY_MS = 86_400_000;

/** "2d overdue", "Today", "Tomorrow", "in 3d", "Mon Sep 8". */
export function formatRelativeDue(due: string | null, now: Date = new Date()): string {
  if (!due) return "No date";
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return "No date";

  const days = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY_MS);

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 6) return `in ${days}d`;

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** "Fri, Aug 31, 2026, 11:59 PM" — full form for a detail page. */
export function formatDueFull(due: string | null): string | null {
  if (!due) return null;
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return null;
  const hasTime = d.getHours() !== 23 || d.getMinutes() !== 59;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(hasTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
