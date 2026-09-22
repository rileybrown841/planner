"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { Pomodoro } from "@/components/pomodoro/use-pomodoro";
import { PHASE_LABEL, formatClock, phaseSeconds } from "@/lib/pomodoro";
import { Button, buttonClass } from "@/components/ui/button";
import { FormField, controlClass } from "@/components/ui/form-field";
import { cn } from "@/lib/cn";

const PHASE_TONE: Record<string, string> = {
  focus: "bg-indigo-600/10 text-indigo-700 dark:text-indigo-300",
  short_break: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  long_break: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

export function PomodoroTimer({ pomo }: { pomo: Pomodoro }) {
  const { phase, running, remaining, settings, focusesCompleted, hydrated, start, pause, reset, skip, updateSettings } =
    pomo;

  const total = phaseSeconds(phase, settings);
  const pct = total > 0 ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0;

  // Focus sessions completed in the cycle in progress — a fresh multiple of
  // `sessionsUntilLongBreak` only reads as "full" while still on that long break.
  const raw = focusesCompleted % settings.sessionsUntilLongBreak;
  const dotsFilled = raw === 0 && focusesCompleted > 0 && phase === "long_break"
    ? settings.sessionsUntilLongBreak
    : raw;

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-black/10 bg-white/50 p-8 dark:border-white/10 dark:bg-white/[0.02]">
      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", PHASE_TONE[phase])}>
        {PHASE_LABEL[phase]}
      </span>

      <span className="font-bold tabular-nums leading-none" style={{ fontSize: "5rem" }}>
        {formatClock(remaining)}
      </span>

      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-1.5" aria-label="Sessions until long break">
        {Array.from({ length: settings.sessionsUntilLongBreak }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              i < dotsFilled ? "bg-indigo-500" : "bg-black/15 dark:bg-white/15",
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {running ? (
          <Button type="button" onClick={pause} size="md">
            <Pause className="size-4" />
            Pause
          </Button>
        ) : (
          <Button type="button" onClick={start} size="md">
            <Play className="size-4" />
            Start
          </Button>
        )}
        <button type="button" onClick={reset} aria-label="Reset this phase" className={buttonClass({ variant: "secondary" })}>
          <RotateCcw className="size-4" />
        </button>
        <button type="button" onClick={skip} aria-label="Skip to the next phase" className={buttonClass({ variant: "ghost" })}>
          <SkipForward className="size-4" />
        </button>
      </div>

      <details className="w-full max-w-sm">
        <summary className="cursor-pointer list-none text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Timer settings
        </summary>
        {/* Keyed to remount once the persisted settings load, so these
            uncontrolled fields' `defaultValue`s pick up the real numbers
            instead of getting stuck on whatever rendered first. */}
        <div key={hydrated ? "loaded" : "initial"} className="mt-3 grid grid-cols-2 gap-3">
          <FormField label="Focus (min)">
            <input
              type="number"
              min={1}
              max={180}
              defaultValue={settings.focusMinutes}
              onBlur={(e) => updateSettings({ focusMinutes: Number(e.target.value) })}
              className={controlClass}
            />
          </FormField>
          <FormField label="Short break (min)">
            <input
              type="number"
              min={1}
              max={180}
              defaultValue={settings.shortBreakMinutes}
              onBlur={(e) => updateSettings({ shortBreakMinutes: Number(e.target.value) })}
              className={controlClass}
            />
          </FormField>
          <FormField label="Long break (min)">
            <input
              type="number"
              min={1}
              max={180}
              defaultValue={settings.longBreakMinutes}
              onBlur={(e) => updateSettings({ longBreakMinutes: Number(e.target.value) })}
              className={controlClass}
            />
          </FormField>
          <FormField label="Sessions / long break">
            <input
              type="number"
              min={1}
              max={12}
              defaultValue={settings.sessionsUntilLongBreak}
              onBlur={(e) => updateSettings({ sessionsUntilLongBreak: Number(e.target.value) })}
              className={controlClass}
            />
          </FormField>
        </div>
      </details>
    </div>
  );
}
