/**
 * Client-side recurrence expansion. No dependencies — we only support four
 * patterns (none / weekly / biweekly / monthly-by-weekday), so the math is
 * small. All dates are the viewer's local time.
 */
import type { Meeting, MeetingFreq } from "@/lib/types";
import { DAYKEY_TO_JS, JS_TO_DAYKEY } from "@/lib/days";
import { addDays, fromDateKey, startOfDay, toDateKey } from "@/lib/dates";

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
 * `clamp` optionally restricts to a semester's date window.
 */
export function meetingDates(
  meeting: Meeting,
  from: Date,
  to: Date,
  clamp?: { start: string | null; end: string | null },
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
    if (matchesFreq(d, anchor, freq)) out.push(new Date(d));
  }
  return out;
}

/** Occurrence start Dates (with time) for an event in [from, to). */
export function eventStartDates(
  startsAt: Date,
  freq: MeetingFreq | null,
  from: Date,
  to: Date,
): Date[] {
  if (!freq) {
    return startsAt >= from && startsAt < to ? [new Date(startsAt)] : [];
  }
  const meeting: Meeting = {
    day: JS_TO_DAYKEY[startsAt.getDay()],
    start: "00:00",
    end: "00:00",
    freq,
    anchor: toDateKey(startsAt),
  };
  return meetingDates(meeting, from, to).map((d) => {
    const x = new Date(d);
    x.setHours(startsAt.getHours(), startsAt.getMinutes(), 0, 0);
    return x;
  });
}

function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}
function minDate(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}
