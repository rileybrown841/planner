"use client";

import { useOptimistic, useTransition } from "react";
import type { AssessmentWithClass, TaskStatus, TaskWithLinks } from "@/lib/types";
import { BUCKET_LABEL, BUCKET_ORDER, bucketFor, type DueBucket } from "@/lib/dates";
import { priorityRank } from "@/lib/priority";
import { setTaskStatus } from "@/lib/actions/tasks";
import { toggleAssessmentDone } from "@/lib/actions/assessments";
import { TaskRow } from "@/components/task/task-row";
import { AssessmentRow } from "@/components/assessment/assessment-row";

type TaskChange = { id: string; status: TaskStatus };
type AssessmentChange = { id: string; done: boolean };

/**
 * A task or an assessment, normalised just enough to bucket and sort them
 * together — exams/projects are checkable and due-date-bucketed exactly like
 * tasks here, they just render as `<AssessmentRow>` so they stay visually
 * distinct (kind chip, no priority).
 */
type Entry =
  | { kind: "task"; id: string; dueDate: string | null; rank: number; done: boolean; completedAt: string | null; task: TaskWithLinks }
  | {
      kind: "assessment";
      id: string;
      dueDate: string | null;
      rank: number;
      done: boolean;
      completedAt: string | null;
      assessment: AssessmentWithClass;
    };

/** Exams/projects have no priority — rank them as "medium" for sort purposes. */
const ASSESSMENT_RANK = priorityRank("medium");

export function TaskBoard({
  tasks,
  assessments = [],
}: {
  tasks: TaskWithLinks[];
  assessments?: AssessmentWithClass[];
}) {
  const [, startTransition] = useTransition();

  const [optimisticTasks, applyTaskChange] = useOptimistic(
    tasks,
    (state, change: TaskChange) =>
      state.map((t) => (t.id === change.id ? { ...t, status: change.status } : t)),
  );
  const [optimisticAssessments, applyAssessmentChange] = useOptimistic(
    assessments,
    (state, change: AssessmentChange) =>
      state.map((a) =>
        a.id === change.id
          ? { ...a, completed_at: change.done ? new Date().toISOString() : null }
          : a,
      ),
  );

  function onToggleTask(task: TaskWithLinks) {
    const status: TaskStatus = task.status === "done" ? "todo" : "done";
    startTransition(async () => {
      applyTaskChange({ id: task.id, status });
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("status", status);
      await setTaskStatus(fd);
    });
  }

  function onToggleAssessment(assessment: AssessmentWithClass) {
    const done = !assessment.completed_at;
    startTransition(async () => {
      applyAssessmentChange({ id: assessment.id, done });
      const fd = new FormData();
      fd.set("id", assessment.id);
      fd.set("done", String(done));
      await toggleAssessmentDone(fd);
    });
  }

  // Step progress per parent task, from the full task list.
  const stepsByParent = new Map<string, { total: number; done: number }>();
  for (const t of optimisticTasks) {
    if (!t.parent_task_id) continue;
    const c = stepsByParent.get(t.parent_task_id) ?? { total: 0, done: 0 };
    c.total += 1;
    if (t.status === "done") c.done += 1;
    stepsByParent.set(t.parent_task_id, c);
  }

  const entries: Entry[] = [
    ...optimisticTasks.map(
      (task): Entry => ({
        kind: "task",
        id: task.id,
        dueDate: task.due_date,
        rank: priorityRank(task.priority),
        done: task.status === "done",
        completedAt: task.completed_at,
        task,
      }),
    ),
    ...optimisticAssessments.map(
      (assessment): Entry => ({
        kind: "assessment",
        id: assessment.id,
        dueDate: assessment.due_date,
        rank: ASSESSMENT_RANK,
        done: !!assessment.completed_at,
        completedAt: assessment.completed_at,
        assessment,
      }),
    ),
  ];

  const active = entries.filter((e) => !e.done);
  const done = entries
    .filter((e) => e.done)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  const buckets = new Map<DueBucket, Entry[]>();
  for (const entry of active) {
    const key = bucketFor(entry.dueDate);
    const list = buckets.get(key) ?? [];
    list.push(entry);
    buckets.set(key, list);
  }
  for (const list of buckets.values()) {
    list.sort(
      (a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || b.rank - a.rank,
    );
  }

  function renderEntry(entry: Entry) {
    return entry.kind === "task" ? (
      <TaskRow
        key={`task-${entry.id}`}
        task={entry.task}
        onToggle={onToggleTask}
        steps={stepsByParent.get(entry.id)}
      />
    ) : (
      <AssessmentRow key={`assessment-${entry.id}`} assessment={entry.assessment} onToggle={onToggleAssessment} />
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
        Nothing here. Use the <span className="font-medium">+</span> button to add a task.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {BUCKET_ORDER.map((key) => {
        const list = buckets.get(key);
        if (!list?.length) return null;
        return (
          <section key={key} className="flex flex-col gap-1">
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {BUCKET_LABEL[key]}
              <span className="ml-1.5 font-normal text-zinc-300 dark:text-zinc-600">
                {list.length}
              </span>
            </h2>
            <ul>{list.map(renderEntry)}</ul>
          </section>
        );
      })}

      {done.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Done
            <span className="ml-1.5 font-normal text-zinc-300 dark:text-zinc-600">
              {done.length}
            </span>
          </summary>
          <ul className="mt-1">{done.map(renderEntry)}</ul>
        </details>
      )}
    </div>
  );
}
