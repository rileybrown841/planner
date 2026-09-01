import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Archive, ArchiveRestore } from "lucide-react";
import { getHabit, listHabitLogs } from "@/lib/data/habits";
import { archiveHabit, unarchiveHabit, deleteHabit } from "@/lib/actions/habits";
import { editHabitHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { HabitTracker } from "@/components/habit/habit-tracker";
import { HabitHistory } from "@/components/habit/habit-history";

export const metadata: Metadata = { title: "Habit" };

function kindLabel(habit: { kind: string; target: number | null; unit: string | null }): string {
  if (habit.kind === "checklist") return "Checklist";
  if (habit.target) return `Counter · ${habit.target}${habit.unit ? ` ${habit.unit}` : ""} / day`;
  return "Counter";
}

export default async function HabitDetailPage({ params }: PageProps<"/habits/[habitId]">) {
  const { habitId } = await params;
  const habit = await getHabit(habitId);
  if (!habit) notFound();

  const logs = await listHabitLogs();

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/habits"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        All habits
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <span
          aria-hidden
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-full text-lg"
          style={habit.icon ? undefined : colorDotStyle(habit.color)}
        >
          {habit.icon}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl">{habit.name}</h1>
          <p className="text-sm text-zinc-500">{kindLabel(habit)}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link href={editHabitHref(habit.id)} className={buttonClass({ variant: "secondary", size: "sm" })}>
            Edit
          </Link>
          <form action={habit.is_archived ? unarchiveHabit : archiveHabit}>
            <input type="hidden" name="id" value={habit.id} />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
              {habit.is_archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              {habit.is_archived ? "Restore" : "Archive"}
            </button>
          </form>
          <form action={deleteHabit}>
            <input type="hidden" name="id" value={habit.id} />
            <ConfirmSubmit message={`Delete "${habit.name}" and its whole history?`}>
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </header>

      {habit.is_archived ? (
        <p className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.02]">
          Archived — restore it to log again.
        </p>
      ) : (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Today</h2>
          <HabitTracker habits={[habit]} logs={logs} />
        </div>
      )}

      <HabitHistory habit={habit} logs={logs} />
    </section>
  );
}
