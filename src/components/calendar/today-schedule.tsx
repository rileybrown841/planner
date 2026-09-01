"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CalendarSourceData } from "@/lib/calendar";
import { buildCalendarItems } from "@/lib/calendar";
import { addDays, startOfDay } from "@/lib/dates";
import { colorDotStyle } from "@/lib/colors";

function clock(d: Date, meridiem = true): string {
  let s = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  s = s.replace(":00", "");
  if (!meridiem) s = s.replace(/\s?[AP]M$/i, "");
  return s;
}

/** "9–9:50 AM" / "2 PM" (meridiem dropped from the start when it matches the end). */
function timeRange(start: Date, end: Date | null): string {
  if (!end) return clock(start);
  const sameHalf = start.getHours() < 12 === end.getHours() < 12;
  return `${clock(start, !sameHalf)}–${clock(end)}`;
}

/** Compact list of today's timed classes / activities / events (local day). */
export function TodaySchedule({ sources }: { sources: CalendarSourceData }) {
  const items = useMemo(() => {
    const start = startOfDay(new Date());
    return buildCalendarItems(sources, start, addDays(start, 1))
      .filter((i) => !i.allDay)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [sources]);

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing scheduled today.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((i) => (
        <li key={i.key}>
          <Link href={i.href} className="flex items-center gap-2.5 text-sm">
            <span className="w-24 shrink-0 text-right text-xs tabular-nums text-zinc-500">
              {timeRange(i.start, i.end)}
            </span>
            <span aria-hidden className="size-2 shrink-0 rounded-full" style={colorDotStyle(i.color)} />
            <span className="truncate">{i.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
