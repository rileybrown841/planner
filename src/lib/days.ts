import type { ClassMeeting, DayKey } from "@/lib/types";

export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const satisfies readonly DayKey[];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_SHORT: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

/** "09:00" -> "9:00 AM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "Mon 9:00 AM – 9:50 AM" */
export function formatMeeting(m: ClassMeeting): string {
  return `${DAY_SHORT[m.day]} ${formatTime(m.start)} – ${formatTime(m.end)}`;
}

/** Sort meetings by weekday then start time. */
export function sortMeetings(meetings: ClassMeeting[]): ClassMeeting[] {
  return [...meetings].sort(
    (a, b) =>
      DAY_KEYS.indexOf(a.day) - DAY_KEYS.indexOf(b.day) ||
      a.start.localeCompare(b.start),
  );
}
