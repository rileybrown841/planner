"use client";

import type { CalendarItem } from "@/lib/types";
import { addDays, sameDay, startOfMonth, startOfWeek } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { CalendarChip } from "@/components/calendar/calendar-chip";

const MAX_CHIPS = 3;

export function MonthGrid({
  anchor,
  items,
  onSelectDay,
}: {
  anchor: Date;
  items: CalendarItem[];
  onSelectDay: (day: Date) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(anchor));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const month = anchor.getMonth();
  const today = new Date();

  const itemsFor = (day: Date) =>
    items
      .filter((i) => sameDay(i.start, day))
      .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime());

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      <div className="grid grid-cols-7 border-b border-black/10 text-center text-xs font-medium text-zinc-500 dark:border-white/10">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = itemsFor(day);
          const inMonth = day.getMonth() === month;
          const isToday = sameDay(day, today);
          const extra = dayItems.length - MAX_CHIPS;
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex min-h-[6rem] flex-col gap-0.5 border-b border-l border-black/5 p-1 dark:border-white/5",
                !inMonth && "bg-black/[0.015] dark:bg-white/[0.015]",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                aria-label={`Open ${day.toLocaleDateString()}`}
                className={cn(
                  "self-end text-xs",
                  isToday
                    ? "grid size-5 place-items-center rounded-full bg-indigo-600 text-white"
                    : inMonth
                      ? "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      : "text-zinc-300 dark:text-zinc-600",
                )}
              >
                {day.getDate()}
              </button>
              {dayItems.slice(0, MAX_CHIPS).map((i) => (
                <CalendarChip key={i.key} item={i} />
              ))}
              {extra > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className="px-1 text-left text-[0.7rem] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  +{extra} more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
