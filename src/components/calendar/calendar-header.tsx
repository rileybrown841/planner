"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addDays, startOfWeek, toDateKey } from "@/lib/dates";
import { newEventHref } from "@/lib/routes";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type CalendarViewMode = "month" | "week" | "day";

const VIEWS: CalendarViewMode[] = ["month", "week", "day"];

function title(view: CalendarViewMode, anchor: Date): string {
  if (view === "month") {
    return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  if (view === "day") {
    return anchor.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function CalendarHeader({
  view,
  anchor,
  onPrev,
  onNext,
  onToday,
  onView,
}: {
  view: CalendarViewMode;
  anchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onView: (v: CalendarViewMode) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous"
          onClick={onPrev}
          className="focus-ring grid size-10 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
        >
          Today
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={onNext}
          className="focus-ring grid size-10 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <h1 className="font-display text-2xl">{title(view, anchor)}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex rounded-lg border border-black/15 p-0.5 text-sm dark:border-white/15">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onView(v)}
              className={cn(
                "focus-ring rounded-md px-3 py-1.5 capitalize",
                v === view
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <Link
          href={newEventHref(toDateKey(anchor))}
          className={buttonClass({ size: "sm", className: "hidden sm:inline-flex" })}
        >
          <Plus className="size-4" />
          New event
        </Link>
      </div>
    </div>
  );
}
