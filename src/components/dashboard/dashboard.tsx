"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import type { Route } from "next";
import type { CalendarSources } from "@/lib/data/calendar";
import { bucketFor, formatRelativeDue } from "@/lib/dates";
import { assessmentHref } from "@/lib/routes";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ComingUp } from "@/components/dashboard/coming-up";
import { TodaySchedule } from "@/components/calendar/today-schedule";
import { DueSoon } from "@/components/task/due-soon";

function Panel({
  title,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  href: Route;
  hrefLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
        <Link
          href={href}
          className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {hrefLabel}
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Dashboard({
  sources,
  openTaskCount,
}: {
  sources: CalendarSources;
  openTaskCount: number;
}) {
  const { dueToday, overdue, nextAssessment } = useMemo(() => {
    const buckets = sources.tasks.map((t) => bucketFor(t.due_date));
    return {
      dueToday: buckets.filter((b) => b === "overdue" || b === "today").length,
      overdue: buckets.filter((b) => b === "overdue").length,
      nextAssessment: sources.assessments.find((a) => a.due_date) ?? null,
    };
  }, [sources]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          label="Due today"
          value={dueToday}
          sublabel={overdue > 0 ? `${overdue} overdue` : undefined}
          tone={dueToday > 0 ? "warn" : "default"}
          href="/tasks"
        />
        <StatTile
          label="Next exam / project"
          value={nextAssessment ? formatRelativeDue(nextAssessment.due_date) : "—"}
          sublabel={nextAssessment?.title ?? "None scheduled"}
          href={nextAssessment ? assessmentHref(nextAssessment.id) : "/exams"}
        />
        <StatTile label="Open tasks" value={openTaskCount} href="/tasks" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Today" href="/calendar" hrefLabel="Calendar →">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-zinc-400">
                Schedule
              </h3>
              <TodaySchedule sources={sources} />
            </div>
            <div>
              <h3 className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-zinc-400">
                Due today &amp; overdue
              </h3>
              <DueSoon tasks={sources.tasks} />
            </div>
          </div>
        </Panel>

        <Panel title="Coming up" href="/tasks" hrefLabel="All tasks →">
          <ComingUp sources={sources} />
        </Panel>
      </div>
    </div>
  );
}
