/**
 * Pure, client-safe habit maths — streaks, history, and the optimistic quick-tap
 * reducer. All day boundaries are the viewer's local time (`toDateKey`), never
 * the server's, so these run in Client Components with `new Date()`.
 */
import type { Habit, HabitLog } from "@/lib/types";
import { addDays, fromDateKey, toDateKey } from "@/lib/dates";

export type LogAction = "increment" | "decrement" | "toggle";

/** A day counts toward a streak once its value meets the target (any value > 0 when there's no target). */
export function isComplete(value: number, target: number | null): boolean {
  return target && target > 0 ? value >= target : value > 0;
}

/** `"YYYY-MM-DD" → value` for one habit's logs. */
export function logMap(logs: HabitLog[], habitId: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    if (log.habit_id === habitId) map.set(log.log_date, log.value);
  }
  return map;
}

const shiftKey = (key: string, days: number) => toDateKey(addDays(fromDateKey(key), days));

/**
 * Consecutive complete days ending today — or yesterday, if today isn't logged
 * yet, so an as-yet-unlogged day doesn't prematurely zero an ongoing streak.
 */
export function currentStreak(
  map: Map<string, number>,
  target: number | null,
  todayKey: string,
): number {
  let cursor = todayKey;
  if (!isComplete(map.get(cursor) ?? 0, target)) cursor = shiftKey(cursor, -1);

  let streak = 0;
  while (isComplete(map.get(cursor) ?? 0, target)) {
    streak++;
    cursor = shiftKey(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive complete days anywhere in the log history. */
export function longestStreak(map: Map<string, number>, target: number | null): number {
  const days = [...map.keys()].filter((k) => isComplete(map.get(k) ?? 0, target)).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    run = prev && shiftKey(prev, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
}

/** The last `days` days (oldest first) for a history strip. */
export function recentHistory(
  map: Map<string, number>,
  target: number | null,
  todayKey: string,
  days: number,
): { date: string; value: number; complete: boolean }[] {
  const out: { date: string; value: number; complete: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftKey(todayKey, -i);
    const value = map.get(date) ?? 0;
    out.push({ date, value, complete: isComplete(value, target) });
  }
  return out;
}

/** Total complete days in the last `days` days. */
export function completedInWindow(
  map: Map<string, number>,
  target: number | null,
  todayKey: string,
  days: number,
): number {
  return recentHistory(map, target, todayKey, days).filter((d) => d.complete).length;
}

/**
 * Apply a quick-tap to a habit's logs, mirroring `logHabit`'s read-modify-write:
 * increment/decrement adjust the counter (0 removes the row); toggle adds or
 * removes a value-1 row. Used as the `useOptimistic` reducer.
 */
export function applyLogAction(
  logs: HabitLog[],
  habitId: string,
  date: string,
  action: LogAction,
): HabitLog[] {
  const idx = logs.findIndex((l) => l.habit_id === habitId && l.log_date === date);
  const existing = idx >= 0 ? logs[idx] : null;

  if (action === "toggle") {
    if (existing) return logs.filter((_, i) => i !== idx);
    return [...logs, stubLog(habitId, date, 1)];
  }

  const next = (existing?.value ?? 0) + (action === "increment" ? 1 : -1);
  if (next <= 0) return existing ? logs.filter((_, i) => i !== idx) : logs;
  if (existing) return logs.map((l, i) => (i === idx ? { ...l, value: next } : l));
  return [...logs, stubLog(habitId, date, next)];
}

function stubLog(habitId: string, date: string, value: number): HabitLog {
  return {
    id: `optimistic:${habitId}:${date}`,
    user_id: "",
    habit_id: habitId,
    log_date: date,
    value,
    created_at: new Date().toISOString(),
  };
}

/** "3 / 8 glasses" · "3 glasses" · "Not done" / "Done" — the today-status line. */
export function statusLabel(habit: Pick<Habit, "kind" | "target" | "unit">, value: number): string {
  if (habit.kind === "checklist") return value > 0 ? "Done today" : "Not done yet";
  const unit = habit.unit ? ` ${habit.unit}` : "";
  return habit.target ? `${value} / ${habit.target}${unit}` : `${value}${unit}`;
}
