"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CalendarSourceData } from "@/lib/calendar";
import { buildCalendarItems } from "@/lib/calendar";
import { addDays, startOfDay } from "@/lib/dates";
import { colorDotStyle } from "@/lib/colors";

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
            <span
              className="w-14 shrink-0 text-right tabular-nums text-xs text-zinc-500"
            >
              {i.start
                .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
                .replace(":00", "")}
            </span>
            <span aria-hidden className="size-2 shrink-0 rounded-full" style={colorDotStyle(i.color)} />
            <span className="truncate">{i.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
