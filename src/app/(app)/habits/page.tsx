import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getHabitsData } from "@/lib/data/habits";
import { unarchiveHabit, deleteHabit } from "@/lib/actions/habits";
import { habitHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { HabitTracker } from "@/components/habit/habit-tracker";

export const metadata: Metadata = { title: "Habits" };

export default async function HabitsPage({ searchParams }: PageProps<"/habits">) {
  const [{ habits, logs }, params] = await Promise.all([getHabitsData(), searchParams]);
  const error = typeof params.error === "string" ? params.error : undefined;

  const active = habits.filter((h) => !h.is_archived);
  const archived = habits.filter((h) => h.is_archived);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Habits</h1>
          <p className="text-sm text-zinc-500">Tap to log. Keep the streak going.</p>
        </div>
        <Link href="/habits/new" className={buttonClass()}>
          <Plus className="size-4" />
          New habit
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
          No habits yet. Add one — a water counter, a vitamins checkbox — and log it with a tap.
        </div>
      ) : active.length === 0 ? (
        <p className="text-sm text-zinc-500">All habits are archived.</p>
      ) : (
        <HabitTracker habits={active} logs={logs} />
      )}

      {archived.length > 0 && (
        <details>
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Archived ({archived.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {archived.map((h) => (
              <li
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={colorDotStyle(h.color)} />
                <Link href={habitHref(h.id)} className="focus-ring min-w-0 flex-1 truncate rounded text-sm">
                  {h.icon ? `${h.icon} ` : ""}
                  {h.name}
                </Link>
                <form action={unarchiveHabit}>
                  <input type="hidden" name="id" value={h.id} />
                  <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
                    Restore
                  </button>
                </form>
                <form action={deleteHabit}>
                  <input type="hidden" name="id" value={h.id} />
                  <ConfirmSubmit message={`Delete "${h.name}" and its whole history?`}>
                    Delete
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
