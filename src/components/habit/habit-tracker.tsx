"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Habit, HabitLog } from "@/lib/types";
import { applyLogAction, currentStreak, logMap, type LogAction } from "@/lib/habits";
import { toDateKey } from "@/lib/dates";
import { logHabit } from "@/lib/actions/habits";
import { HabitCard } from "@/components/habit/habit-card";

/** Quick-tap list of active habits with optimistic counters. Used on /habits and the dashboard. */
export function HabitTracker({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const [, startTransition] = useTransition();
  const [optimisticLogs, applyChange] = useOptimistic(
    logs,
    (state, c: { habitId: string; date: string; action: LogAction }) =>
      applyLogAction(state, c.habitId, c.date, c.action),
  );

  const [today] = useState(() => toDateKey(new Date()));

  const maps = useMemo(() => {
    const m = new Map<string, ReturnType<typeof logMap>>();
    for (const habit of habits) m.set(habit.id, logMap(optimisticLogs, habit.id));
    return m;
  }, [habits, optimisticLogs]);

  function tap(habit: Habit, action: LogAction) {
    startTransition(async () => {
      applyChange({ habitId: habit.id, date: today, action });
      const fd = new FormData();
      fd.set("habit_id", habit.id);
      fd.set("date", today);
      fd.set("action", action);
      await logHabit(fd);
    });
  }

  if (habits.length === 0) {
    return <p className="text-sm text-zinc-500">No habits yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {habits.map((habit) => {
        const map = maps.get(habit.id) ?? new Map<string, number>();
        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            todayValue={map.get(today) ?? 0}
            streak={currentStreak(map, habit.target, today)}
            onTap={(action) => tap(habit, action)}
          />
        );
      })}
    </ul>
  );
}
