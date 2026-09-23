/**
 * Client-side recurrence expansion. No dependencies — we only support four
 * patterns (none / weekly / biweekly / monthly-by-weekday), so the math is
 * small. All dates are the viewer's local time.
 */
import type { EventRecurrenceRule, Meeting, MeetingFreq } from "@/lib/types";
import { DAYKEY_TO_JS, JS_TO_DAYKEY } from "@/lib/days";
import { addDays, fromDateKey, maxDate, minDate, startOfDay, toDateKey } from "@/lib/dates";

/** Inclusive "YYYY-MM-DD" date range (both ends land on the day). */
export type DateRange = { start: string; end: string };

/** Does `d`'s local calendar day fall within any of the given inclusive ranges? */
function inAnyRange(d: Date, ranges: ReadonlyArray<DateRange>): boolean {
  const t = startOfDay(d).getTime();
  return ranges.some(
    (r) => t >= fromDateKey(r.start).getTime() && t <= fromDateKey(r.end).getTime(),
  );
}

/** 1-based: which occurrence of its weekday this date is within its month. */
export function weekOfMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

/** Is `d` the last occurrence of its weekday in its month? */
export function isLastWeekdayOfMonth(d: Date): boolean {
  return addDays(d, 7).getMonth() !== d.getMonth();
}

/** Monday-aligned absolute week number, for biweekly parity. */
function weekIndex(d: Date): number {
  // 1970-01-01 was a Thursday; +3 shifts the week boundary to Monday.
  return Math.floor((startOfDay(d).getTime() / 86_400_000 + 3) / 7);
}

function matchesFreq(candidate: Date, anchor: Date | null, freq: MeetingFreq): boolean {
  if (freq === "weekly") return true;
  if (!anchor) return false;
  if (candidate < startOfDay(anchor)) return false;

  if (freq === "biweekly") {
    return ((weekIndex(candidate) - weekIndex(anchor)) % 2 + 2) % 2 === 0;
  }
  // monthly: same weekday position within the month as the anchor
  return isLastWeekdayOfMonth(anchor)
    ? isLastWeekdayOfMonth(candidate)
    : weekOfMonth(candidate) === weekOfMonth(anchor);
}

/**
 * Local midnight Dates for every occurrence of a weekday meeting in [from, to).
 * `clamp` optionally restricts to a semester's date window; `exclude` drops any
 * occurrence that lands inside one of the given inclusive date ranges (breaks).
 */
export function meetingDates(
  meeting: Meeting,
  from: Date,
  to: Date,
  clamp?: { start: string | null; end: string | null },
  exclude?: ReadonlyArray<DateRange>,
): Date[] {
  const targetJs = DAYKEY_TO_JS[meeting.day];
  const freq = meeting.freq ?? "weekly";
  const anchor = meeting.anchor ? startOfDay(fromDateKey(meeting.anchor)) : null;

  let lo = startOfDay(from);
  if (clamp?.start) lo = maxDate(lo, startOfDay(fromDateKey(clamp.start)));
  if (freq !== "weekly" && anchor) lo = maxDate(lo, anchor);

  let hi = startOfDay(to);
  if (clamp?.end) hi = minDate(hi, addDays(startOfDay(fromDateKey(clamp.end)), 1));

  const out: Date[] = [];
  let d = new Date(lo);
  while (d.getDay() !== targetJs) d = addDays(d, 1);
  for (; d < hi; d = addDays(d, 7)) {
    if (!matchesFreq(d, anchor, freq)) continue;
    if (exclude?.length && inAnyRange(d, exclude)) continue;
    out.push(new Date(d));
  }
  return out;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * `startsAt`'s month/day/time, transplanted onto `year`. A Feb 29 anchor
 * observes on Feb 28 in non-leap years (rather than skipping 3 years out of 4).
 */
function yearlyOccurrence(startsAt: Date, year: number): Date {
  const month = startsAt.getMonth();
  const isLeapDay = month === 1 && startsAt.getDate() === 29;
  const day = isLeapDay && !isLeapYear(year) ? 28 : startsAt.getDate();
  const d = new Date(year, month, day);
  d.setHours(startsAt.getHours(), startsAt.getMinutes(), 0, 0);
  return d;
}

/** Yearly occurrences of `startsAt` in [from, to), never before `startsAt` itself. */
function yearlyDates(startsAt: Date, from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let year = from.getFullYear() - 1; year <= to.getFullYear() + 1; year++) {
    const occ = yearlyOccurrence(startsAt, year);
    if (occ >= startsAt && occ >= from && occ < to) out.push(occ);
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Occurrence start Dates (with time) for an event in [from, to).
 * `until` ("YYYY-MM-DD", inclusive) caps a recurring series' last occurrence.
 */
export function eventStartDates(
  startsAt: Date,
  freq: EventRecurrenceRule | null,
  from: Date,
  to: Date,
  until?: string | null,
): Date[] {
  if (!freq) {
    return startsAt >= from && startsAt < to ? [new Date(startsAt)] : [];
  }
  const hi = until ? minDate(to, addDays(fromDateKey(until), 1)) : to;

  if (freq === "yearly") {
    return yearlyDates(startsAt, from, hi);
  }

  const meeting: Meeting = {
    day: JS_TO_DAYKEY[startsAt.getDay()],
    start: "00:00",
    end: "00:00",
    freq,
    anchor: toDateKey(startsAt),
  };
  return meetingDates(meeting, from, hi).map((d) => {
    const x = new Date(d);
    x.setHours(startsAt.getHours(), startsAt.getMinutes(), 0, 0);
    return x;
  });
}
