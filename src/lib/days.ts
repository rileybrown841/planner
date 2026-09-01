import type { DayKey, Meeting } from "@/lib/types";

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

/** DayKey ↔ JS Date.getDay() (0 = Sunday). */
export const DAYKEY_TO_JS: Record<DayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const JS_TO_DAYKEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const FREQ_LABEL: Record<NonNullable<Meeting["freq"]>, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

/** "09:00" -> "9:00 AM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "Mon 9:00 AM – 9:50 AM" (+ " · every 2 weeks" when not weekly). */
export function formatMeeting(m: Meeting): string {
  const base = `${DAY_SHORT[m.day]} ${formatTime(m.start)} – ${formatTime(m.end)}`;
  return m.freq && m.freq !== "weekly" ? `${base} · ${FREQ_LABEL[m.freq].toLowerCase()}` : base;
}

/** Sort meetings by weekday then start time. */
export function sortMeetings(meetings: Meeting[]): Meeting[] {
  return [...meetings].sort(
    (a, b) =>
      DAY_KEYS.indexOf(a.day) - DAY_KEYS.indexOf(b.day) ||
      a.start.localeCompare(b.start),
  );
}
