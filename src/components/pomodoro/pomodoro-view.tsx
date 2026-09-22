"use client";

import type { TaskWithLinks } from "@/lib/types";
import { usePomodoro } from "@/components/pomodoro/use-pomodoro";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { FocusTasks } from "@/components/pomodoro/focus-tasks";

export function PomodoroView({ tasks }: { tasks: TaskWithLinks[] }) {
  const pomo = usePomodoro();

  return (
    <div className="flex flex-col gap-6">
      <PomodoroTimer pomo={pomo} />
      <div className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <FocusTasks tasks={tasks} pomo={pomo} />
      </div>
    </div>
  );
}
