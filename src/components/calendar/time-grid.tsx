"use client";

import { useEffect, useState } from "react";
import type { CalendarItem } from "@/lib/types";
import { sameDay } from "@/lib/dates";
import { hourRange, layoutDay } from "@/lib/calendar-layout";
import { CalendarChip } from "@/components/calendar/calendar-chip";
import { EventBlock } from "@/components/calendar/event-block";
import { cn } from "@/lib/cn";

const HOUR_PX = 48;
const PX_PER_MIN = HOUR_PX / 60;

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function TimeGrid({ days, items }: { days: Date[]; items: CalendarItem[] }) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const placedByDay = days.map((d) => layoutDay(items, d));
  const range = placedByDay.reduce(
    (acc, placed) => {
      const r = hourRange(placed);
      return { startHour: Math.min(acc.startHour, r.startHour), endHour: Math.max(acc.endHour, r.endHour) };
    },
    { startHour: 7, endHour: 21 },
  );
  const gridStartMin = range.startHour * 60;
  const totalHeight = (range.endHour - range.startHour) * HOUR_PX;
  const hours = Array.from({ length: range.endHour - range.startHour }, (_, i) => range.startHour + i);

  const today = new Date();

  const allDayFor = (day: Date) =>
    items.filter((i) => i.allDay && sameDay(i.start, day));

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      {/* header: day names + all-day items */}
      <div className="flex border-b border-black/10 bg-[var(--background)] dark:border-white/10">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const isToday = sameDay(day, today);
          return (
            <div key={day.toISOString()} className="min-w-0 flex-1 border-l border-black/10 dark:border-white/10">
              <div
                className={cn(
                  "py-1 text-center text-xs font-medium",
                  isToday ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500",
                )}
              >
                {day.toLocaleDateString(undefined, { weekday: "short" })}{" "}
                <span className={cn(isToday && "rounded bg-indigo-600 px-1 text-white")}>
                  {day.getDate()}
                </span>
              </div>
              <div className="flex min-h-[26px] flex-col gap-0.5 p-0.5">
                {allDayFor(day).map((i) => (
                  <CalendarChip key={i.key} item={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* scrollable hour grid */}
      <div className="flex max-h-[65vh] overflow-y-auto">
        <div className="w-14 shrink-0" style={{ height: totalHeight }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_PX }}
              className="relative -top-2 pr-1.5 text-right text-[0.7rem] text-zinc-400"
            >
              {formatHour(h)}
            </div>
          ))}
        </div>

        {days.map((day, di) => {
          const isToday = sameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className="relative min-w-0 flex-1 border-l border-black/10 dark:border-white/10"
              style={{ height: totalHeight }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_PX }}
                  className="border-b border-black/5 dark:border-white/5"
                />
              ))}

              {placedByDay[di].map((p) => (
                <EventBlock
                  key={p.item.key}
                  placed={p}
                  gridStartMin={gridStartMin}
                  pxPerMin={PX_PER_MIN}
                />
              ))}

              {isToday && nowMin !== null && nowMin >= gridStartMin && nowMin <= range.endHour * 60 && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 border-t border-red-500"
                  style={{ top: (nowMin - gridStartMin) * PX_PER_MIN }}
                >
                  <span className="absolute -left-1 -top-1 size-2 rounded-full bg-red-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
