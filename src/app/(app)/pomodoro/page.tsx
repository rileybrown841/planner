import type { Metadata } from "next";
import { listTasks } from "@/lib/data/tasks";
import { PomodoroView } from "@/components/pomodoro/pomodoro-view";

export const metadata: Metadata = { title: "Pomodoro" };

export default async function PomodoroPage() {
  const tasks = await listTasks();

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl">Pomodoro</h1>
        <p className="text-sm text-zinc-500">
          Work in focused sprints, with short breaks in between.
        </p>
      </header>

      <PomodoroView tasks={tasks} />
    </section>
  );
}
