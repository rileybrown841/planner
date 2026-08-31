import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { displayName } from "@/lib/user";
import { getActiveSemester } from "@/lib/data/semesters";
import { listOpenDatedTasks } from "@/lib/data/tasks";
import { buttonClass } from "@/components/ui/button";
import { DueSoon } from "@/components/task/due-soon";

export const metadata: Metadata = { title: "Today" };

const ROADMAP = [
  { phase: "Phase 1", label: "Foundation — auth, PWA, navigation shell", done: true },
  { phase: "Phase 2", label: "Semesters & classes", done: true },
  { phase: "Phase 3", label: "Tasks & extracurriculars", done: true },
  { phase: "Phase 4", label: "Unified calendar" },
  { phase: "Phase 5", label: "Exam & project tracker" },
  { phase: "Phase 6", label: "Day-at-a-glance dashboard" },
  { phase: "Phase 7", label: "Habit tracking" },
  { phase: "Phase 8", label: "Budgeting" },
  { phase: "Phase 9", label: "Polish — dark mode, search, reminders" },
];

export default async function TodayPage() {
  const [user, activeSemester, datedTasks] = await Promise.all([
    requireUser(),
    getActiveSemester(),
    listOpenDatedTasks(),
  ]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {displayName(user)}.
        </h1>
        <p className="text-sm text-zinc-500">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Overdue &amp; today
          </h2>
          <Link href="/tasks" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            All tasks →
          </Link>
        </div>
        <div className="mt-2">
          <DueSoon tasks={datedTasks} />
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Active semester
        </h2>
        {activeSemester ? (
          <p className="mt-1 text-sm">
            <span className="font-medium">{activeSemester.name}</span>{" "}
            <Link href="/classes" className="text-indigo-600 hover:underline dark:text-indigo-400">
              View classes →
            </Link>
          </p>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-zinc-500">No semester is active yet.</p>
            <Link href="/semesters/new" className={buttonClass({ size: "sm", className: "mt-2" })}>
              Set up a semester
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/50 p-6 dark:border-white/10 dark:bg-white/[0.02]">
        <h2 className="text-sm font-semibold">Build progress</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Features arrive phase by phase. The dashboard that pulls everything
          together into this screen is Phase 6.
        </p>

        <ol className="mt-4 flex flex-col gap-2">
          {ROADMAP.map((item) => (
            <li key={item.phase} className="flex items-center gap-3 text-sm">
              <span
                className={
                  item.done
                    ? "grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-[0.7rem] text-white"
                    : "grid size-5 shrink-0 place-items-center rounded-full border border-black/20 text-[0.7rem] text-zinc-400 dark:border-white/20"
                }
              >
                {item.done ? "✓" : ""}
              </span>
              <span className="font-medium text-zinc-400">{item.phase}</span>
              <span className={item.done ? "text-zinc-500 line-through" : ""}>
                {item.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
