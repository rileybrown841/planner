"use client";

import Link from "next/link";
import { Check, Flame, Minus, Plus } from "lucide-react";
import type { Habit } from "@/lib/types";
import type { LogAction } from "@/lib/habits";
import { isComplete, statusLabel } from "@/lib/habits";
import { habitHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";

export function HabitCard({
  habit,
  todayValue,
  streak,
  onTap,
}: {
  habit: Habit;
  todayValue: number;
  streak: number;
  /** Omit for a static, non-interactive card (archived list). */
  onTap?: (action: LogAction) => void;
}) {
  const done = isComplete(todayValue, habit.target);
  const pct =
    habit.kind === "counter" && habit.target
      ? Math.min(100, Math.round((todayValue / habit.target) * 100))
      : done
        ? 100
        : 0;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full text-sm"
        style={habit.icon ? undefined : colorDotStyle(habit.color)}
      >
        {habit.icon ? (
          <span className="text-lg leading-none">{habit.icon}</span>
        ) : null}
      </span>

      <Link href={habitHref(habit.id)} className="focus-ring flex min-w-0 flex-1 flex-col gap-1 rounded">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{habit.name}</span>
          {streak > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Flame className="size-3" />
              {streak}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("text-xs tabular-nums", done ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500")}>
            {statusLabel(habit, todayValue)}
          </span>
        </span>
        {habit.kind === "counter" && habit.target ? (
          <span className="h-1 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <span
              className="block h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </span>
        ) : null}
      </Link>

      {onTap && (
        <div className="flex shrink-0 items-center gap-1">
          {habit.kind === "checklist" ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={done}
              aria-label={done ? "Mark not done" : "Mark done"}
              onClick={() => onTap("toggle")}
              className={cn(
                "focus-ring grid size-9 place-items-center rounded-full border transition-colors",
                done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-black/25 hover:border-emerald-500 dark:border-white/30",
              )}
            >
              {done && <Check className="size-4" strokeWidth={3} />}
            </button>
          ) : (
            <>
              <button
                type="button"
                aria-label={`Remove one from ${habit.name}`}
                disabled={todayValue <= 0}
                onClick={() => onTap("decrement")}
                className="focus-ring grid size-9 place-items-center rounded-full text-zinc-500 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">{todayValue}</span>
              <button
                type="button"
                aria-label={`Add one to ${habit.name}`}
                onClick={() => onTap("increment")}
                className="focus-ring grid size-9 place-items-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
              >
                <Plus className="size-4" />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
