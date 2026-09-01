"use client";

import { useMemo, useState } from "react";
import type { CalendarSourceData } from "@/lib/calendar";
import { STANDALONE_EVENT_COLOR, TASK_COLOR, buildCalendarItems } from "@/lib/calendar";
import {
  addDays,
  fromDateKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "@/lib/dates";
import { colorDotStyle } from "@/lib/colors";
import { CalendarHeader, type CalendarViewMode } from "@/components/calendar/calendar-header";
import { MonthGrid } from "@/components/calendar/month-grid";
import { TimeGrid } from "@/components/calendar/time-grid";

const LEGEND = [
  { label: "Class / activity", color: null },
  { label: "Event", color: STANDALONE_EVENT_COLOR },
  { label: "Exam / project", color: STANDALONE_EVENT_COLOR },
  { label: "Task due", color: TASK_COLOR },
];

export function CalendarView({
  sources,
  initialView,
  initialDate,
}: {
  sources: CalendarSourceData;
  initialView: CalendarViewMode;
  initialDate: string;
}) {
  const [view, setView] = useState<CalendarViewMode>(initialView);
  const [anchor, setAnchor] = useState<Date>(() => {
    const d = initialDate ? fromDateKey(initialDate) : new Date();
    return Number.isNaN(d.getTime()) ? startOfDay(new Date()) : startOfDay(d);
  });

  function go(v: CalendarViewMode, a: Date) {
    setView(v);
    setAnchor(a);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/calendar?view=${v}&date=${toDateKey(a)}`);
    }
  }

  function shift(dir: number) {
    if (view === "month") {
      const d = new Date(anchor);
      d.setMonth(d.getMonth() + dir);
      go(view, startOfDay(d));
    } else {
      go(view, addDays(anchor, dir * (view === "week" ? 7 : 1)));
    }
  }

  const { rangeStart, rangeEnd, days } = useMemo(() => {
    if (view === "month") {
      const gridStart = startOfWeek(startOfMonth(anchor));
      return { rangeStart: gridStart, rangeEnd: addDays(gridStart, 42), days: [] as Date[] };
    }
    if (view === "week") {
      const s = startOfWeek(anchor);
      return {
        rangeStart: s,
        rangeEnd: addDays(s, 7),
        days: Array.from({ length: 7 }, (_, i) => addDays(s, i)),
      };
    }
    const s = startOfDay(anchor);
    return { rangeStart: s, rangeEnd: addDays(s, 1), days: [s] };
  }, [view, anchor]);

  const items = useMemo(
    () => buildCalendarItems(sources, rangeStart, rangeEnd),
    [sources, rangeStart, rangeEnd],
  );

  return (
    <section className="flex flex-col gap-4">
      <CalendarHeader
        view={view}
        anchor={anchor}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onToday={() => go(view, startOfDay(new Date()))}
        onView={(v) => go(v, anchor)}
      />

      {view === "month" ? (
        <MonthGrid anchor={anchor} items={items} onSelectDay={(d) => go("day", d)} />
      ) : (
        <TimeGrid days={days} items={items} />
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        {LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={colorDotStyle(l.color)} />
            {l.label}
          </span>
        ))}
        <span className="text-zinc-400">
          Classes shown for the active semester only.
        </span>
      </div>
    </section>
  );
}
