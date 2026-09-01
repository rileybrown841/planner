"use client";

import type { MeetingFreq } from "@/lib/types";
import { FREQ_LABEL } from "@/lib/days";

const time = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const dateLong = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function EventWhen({
  startsAt,
  endsAt,
  allDay,
  recurrence,
}: {
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  recurrence: MeetingFreq | null;
}) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  let when: string;
  if (allDay) {
    when = `${dateLong(start)} · all day`;
  } else if (end) {
    when = `${dateLong(start)} · ${time(start)} – ${time(end)}`;
  } else {
    when = `${dateLong(start)} · ${time(start)}`;
  }

  return (
    <span>
      {when}
      {recurrence && (
        <span className="text-zinc-500"> · repeats {FREQ_LABEL[recurrence].toLowerCase()}</span>
      )}
    </span>
  );
}
