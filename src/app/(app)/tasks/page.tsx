import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listTasks } from "@/lib/data/tasks";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { listOpenAssessments } from "@/lib/data/assessments";
import { PRIORITIES } from "@/lib/priority";
import type { TaskPriority } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskBoard } from "@/components/task/task-board";
import { AssessmentChecklist } from "@/components/assessment/assessment-checklist";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const params = await searchParams;
  const classId = typeof params.class === "string" ? params.class : undefined;
  const activityId = typeof params.activity === "string" ? params.activity : undefined;
  const priorityParam = typeof params.priority === "string" ? params.priority : undefined;
  const priority = PRIORITIES.includes(priorityParam as TaskPriority)
    ? (priorityParam as TaskPriority)
    : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  const [tasks, classGroups, activities, assessments] = await Promise.all([
    listTasks({ classId, activityId, priority, includeDone: true }),
    listClassPickerOptions(),
    listExtracurriculars(),
    listOpenAssessments(),
  ]);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Tasks</h1>
        <Link href="/tasks/new" className={buttonClass({ size: "sm" })}>
          <Plus className="size-4" />
          New task
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Exams &amp; projects
          </h2>
          <Link href="/exams" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            All exams →
          </Link>
        </div>
        <AssessmentChecklist
          assessments={assessments}
          emptyText="No exams or projects need attention."
        />
      </section>

      <TaskFilters classGroups={classGroups} activities={activities} />
      <TaskBoard tasks={tasks} />
    </section>
  );
}
