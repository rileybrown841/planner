/**
 * Pure Pomodoro maths — phase sequencing and formatting. No storage, no
 * timers: `use-pomodoro.ts` owns the clock and persists state client-side
 * (this is a personal, single-device-at-a-time timer, not synced data).
 */
export type PomodoroPhase = "focus" | "short_break" | "long_break";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** How many focus sessions between long breaks. */
  sessionsUntilLongBreak: number;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
};

export const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

export function clampMinutes(n: number): number {
  return Number.isFinite(n) ? Math.min(180, Math.max(1, Math.round(n))) : 1;
}

export function clampSessions(n: number): number {
  return Number.isFinite(n) ? Math.min(12, Math.max(1, Math.round(n))) : 1;
}

/** Full length of a phase, in seconds. */
export function phaseSeconds(phase: PomodoroPhase, settings: PomodoroSettings): number {
  const minutes =
    phase === "focus"
      ? settings.focusMinutes
      : phase === "short_break"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return clampMinutes(minutes) * 60;
}

/**
 * What comes after a focus session finishes, given the total focus sessions
 * completed so far (including this one). Breaks always return to focus.
 */
export function nextPhase(
  current: PomodoroPhase,
  focusesCompleted: number,
  settings: PomodoroSettings,
): PomodoroPhase {
  if (current !== "focus") return "focus";
  const perCycle = clampSessions(settings.sessionsUntilLongBreak);
  return focusesCompleted > 0 && focusesCompleted % perCycle === 0 ? "long_break" : "short_break";
}

/** "12:34" from whole seconds (never negative). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
