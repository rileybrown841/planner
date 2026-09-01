"use client";

import { useMemo, useState } from "react";
import type { Habit, HabitLog } from "@/lib/types";
import {
  completedInWindow,
  currentStreak,
  longestStreak,
  logMap,
  recentHistory,
} from "@/lib/habits";
import { toDateKey } from "@/lib/dates";
import { cn } from "@/lib/cn";

const WINDOW = 30;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export function HabitHistory({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const [today] = useState(() => toDateKey(new Date()));

  const { days, streak, best, hits } = useMemo(() => {
    const map = logMap(logs, habit.id);
    return {
      days: recentHistory(map, habit.target, today, WINDOW),
      streak: currentStreak(map, habit.target, today),
      best: longestStreak(map, habit.target),
      hits: completedInWindow(map, habit.target, today, WINDOW),
    };
  }, [logs, habit.id, habit.target, today]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Current streak" value={`${streak}d`} />
        <Stat label="Best streak" value={`${best}d`} />
        <Stat label={`Last ${WINDOW} days`} value={`${hits}/${WINDOW}`} />
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Last {WINDOW} days
        </h2>
        <div className="flex flex-wrap gap-1">
          {days.map((d) => (
            <span
              key={d.date}
              title={`${d.date}: ${d.value || "none"}`}
              className={cn(
                "size-5 rounded",
                d.complete
                  ? "bg-emerald-500"
                  : d.value > 0
                    ? "bg-emerald-500/40"
                    : "bg-black/[0.06] dark:bg-white/[0.08]",
                d.date === today && "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
