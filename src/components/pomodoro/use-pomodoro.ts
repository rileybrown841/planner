"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS,
  clampMinutes,
  clampSessions,
  nextPhase,
  phaseSeconds,
  type PomodoroPhase,
  type PomodoroSettings,
} from "@/lib/pomodoro";

const STORAGE_KEY = "planner:pomodoro:v1";

type State = {
  settings: PomodoroSettings;
  phase: PomodoroPhase;
  running: boolean;
  /** Epoch ms the current phase ends at, while running; null while paused. */
  endAt: number | null;
  /** Authoritative remaining seconds while paused; refreshed from `endAt` each tick while running. */
  remaining: number;
  /** Total focus sessions finished — drives the long-break cadence. */
  focusesCompleted: number;
  /** Task ids pinned for this session (cross-referenced against real tasks by the caller). */
  focusTaskIds: string[];
};

function defaultState(): State {
  return {
    settings: DEFAULT_SETTINGS,
    phase: "focus",
    running: false,
    endAt: null,
    remaining: phaseSeconds("focus", DEFAULT_SETTINGS),
    focusesCompleted: 0,
    focusTaskIds: [],
  };
}

/** Ends the current phase — `completed` is false for an early "Skip". */
function advance(s: State, completed: boolean): State {
  const wasFocus = s.phase === "focus";
  const focusesCompleted = wasFocus && completed ? s.focusesCompleted + 1 : s.focusesCompleted;
  const phase = wasFocus ? nextPhase("focus", focusesCompleted, s.settings) : "focus";
  return {
    ...s,
    phase,
    focusesCompleted,
    running: false,
    endAt: null,
    remaining: phaseSeconds(phase, s.settings),
  };
}

/** Recompute `remaining` from `endAt` — catches up after the tab was hidden/closed. */
function resync(s: State): State {
  if (!s.running || s.endAt == null) return s;
  const remaining = Math.round((s.endAt - Date.now()) / 1000);
  return remaining <= 0 ? advance(s, true) : { ...s, remaining };
}

function sanitize(raw: unknown): State {
  const fallback = defaultState();
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<State>;

  const settings: PomodoroSettings = {
    focusMinutes: clampMinutes(Number(r.settings?.focusMinutes)),
    shortBreakMinutes: clampMinutes(Number(r.settings?.shortBreakMinutes)),
    longBreakMinutes: clampMinutes(Number(r.settings?.longBreakMinutes)),
    sessionsUntilLongBreak: clampSessions(Number(r.settings?.sessionsUntilLongBreak)),
  };
  const phase: PomodoroPhase =
    r.phase === "focus" || r.phase === "short_break" || r.phase === "long_break"
      ? r.phase
      : "focus";

  return resync({
    settings,
    phase,
    running: r.running === true,
    endAt: typeof r.endAt === "number" ? r.endAt : null,
    remaining:
      typeof r.remaining === "number" && Number.isFinite(r.remaining)
        ? r.remaining
        : phaseSeconds(phase, settings),
    focusesCompleted:
      typeof r.focusesCompleted === "number" && r.focusesCompleted >= 0 ? r.focusesCompleted : 0,
    focusTaskIds: Array.isArray(r.focusTaskIds) ? r.focusTaskIds.filter((x) => typeof x === "string") : [],
  });
}

export type Pomodoro = ReturnType<typeof usePomodoro>;

export function usePomodoro() {
  const [state, setState] = useState<State>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  // Hydrate from localStorage once on mount — SSR has no access to it, so the
  // first client render briefly shows defaults, same trade-off as the theme
  // toggle's hydration guard. `hydrated` lets number-input consumers key a
  // remount so their (uncontrolled) `defaultValue`s pick up the loaded settings.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(sanitize(JSON.parse(raw)));
      }
    } catch {
      // corrupted/blocked storage — keep defaults
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  // Persist every change (skip the pre-hydration write so we don't clobber
  // a saved session with defaults before the load effect above runs).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore (private browsing / storage full)
    }
  }, [state]);

  // Tick while running; re-derives remaining from the absolute end time so
  // background-tab throttling can't cause drift.
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => {
      setState((s) => resync(s));
    }, 1000);
    return () => clearInterval(id);
  }, [state.running, state.endAt]);

  const start = useCallback(() => {
    setState((s) => (s.running ? s : { ...s, running: true, endAt: Date.now() + s.remaining * 1000 }));
  }, []);

  const pause = useCallback(() => {
    setState((s) => (s.running ? { ...resync(s), running: false, endAt: null } : s));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, running: false, endAt: null, remaining: phaseSeconds(s.phase, s.settings) }));
  }, []);

  const skip = useCallback(() => {
    setState((s) => advance(s, false));
  }, []);

  const updateSettings = useCallback((partial: Partial<PomodoroSettings>) => {
    setState((s) => {
      const settings: PomodoroSettings = {
        focusMinutes: clampMinutes(partial.focusMinutes ?? s.settings.focusMinutes),
        shortBreakMinutes: clampMinutes(partial.shortBreakMinutes ?? s.settings.shortBreakMinutes),
        longBreakMinutes: clampMinutes(partial.longBreakMinutes ?? s.settings.longBreakMinutes),
        sessionsUntilLongBreak: clampSessions(
          partial.sessionsUntilLongBreak ?? s.settings.sessionsUntilLongBreak,
        ),
      };
      // Only snap the visible countdown to the new length while idle — don't
      // yank time out from under a session that's already running.
      const remaining = s.running ? s.remaining : phaseSeconds(s.phase, settings);
      return { ...s, settings, remaining };
    });
  }, []);

  const addFocusTask = useCallback((id: string) => {
    setState((s) => (s.focusTaskIds.includes(id) ? s : { ...s, focusTaskIds: [...s.focusTaskIds, id] }));
  }, []);

  const removeFocusTask = useCallback((id: string) => {
    setState((s) => ({ ...s, focusTaskIds: s.focusTaskIds.filter((x) => x !== id) }));
  }, []);

  const clearFocusTasks = useCallback(() => {
    setState((s) => ({ ...s, focusTaskIds: [] }));
  }, []);

  return {
    ...state,
    hydrated,
    start,
    pause,
    reset,
    skip,
    updateSettings,
    addFocusTask,
    removeFocusTask,
    clearFocusTasks,
  };
}
