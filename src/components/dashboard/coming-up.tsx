"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CalendarItem } from "@/lib/types";
import type { CalendarSourceData } from "@/lib/calendar";
import { buildCalendarItems } from "@/lib/calendar";
import { addDays, sameDay, startOfDay } from "@/lib/dates";
import { colorDotStyle } from "@/lib/colors";

const KIND_TAG: Partial<Record<CalendarItem["kind"], string>> = {
  task: "Task",
  assessment: "Deadline",
  event: "Event",
};

/** Task & exam deadlines (+ one-off all-day events) for the next 7 days. */
export function ComingUp({ sources }: { sources: CalendarSourceData }) {
  const days = useMemo(() => {
    const start = addDays(startOfDay(new Date()), 1);
    const end = addDays(start, 7);
    const items = buildCalendarItems(sources, start, end)
      .filter((i) => i.allDay && i.kind !== "break")
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const groups: { day: Date; items: CalendarItem[] }[] = [];
    for (const item of items) {
      let group = groups.find((g) => sameDay(g.day, item.start));
      if (!group) {
        group = { day: startOfDay(item.start), items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [sources]);

  if (days.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing coming up this week.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map(({ day, items }) => (
        <div key={day.toISOString()} className="flex flex-col gap-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="flex items-center gap-2.5 text-sm">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={colorDotStyle(item.color)}
                  />
                  <span className="truncate">{item.title}</span>
                  {KIND_TAG[item.kind] && (
                    <span className="ml-auto shrink-0 text-xs text-zinc-400">
                      {KIND_TAG[item.kind]}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
