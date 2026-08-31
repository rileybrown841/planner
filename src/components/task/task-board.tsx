"use client";

import { useOptimistic, useTransition } from "react";
import type { TaskStatus, TaskWithLinks } from "@/lib/types";
import { BUCKET_LABEL, BUCKET_ORDER, bucketFor, type DueBucket } from "@/lib/dates";
import { priorityRank } from "@/lib/priority";
import { setTaskStatus } from "@/lib/actions/tasks";
import { TaskRow } from "@/components/task/task-row";

type OptimisticChange = { id: string; status: TaskStatus };

export function TaskBoard({ tasks }: { tasks: TaskWithLinks[] }) {
  const [, startTransition] = useTransition();
  const [optimisticTasks, applyChange] = useOptimistic(
    tasks,
    (state, change: OptimisticChange) =>
      state.map((t) => (t.id === change.id ? { ...t, status: change.status } : t)),
  );

  function onToggle(task: TaskWithLinks) {
    const status: TaskStatus = task.status === "done" ? "todo" : "done";
    startTransition(async () => {
      applyChange({ id: task.id, status });
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("status", status);
      await setTaskStatus(fd);
    });
  }

  const active = optimisticTasks.filter((t) => t.status !== "done");
  const done = optimisticTasks
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  const buckets = new Map<DueBucket, TaskWithLinks[]>();
  for (const task of active) {
    const key = bucketFor(task.due_date);
    const list = buckets.get(key) ?? [];
    list.push(task);
    buckets.set(key, list);
  }
  for (const list of buckets.values()) {
    list.sort(
      (a, b) =>
        (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") ||
        priorityRank(b.priority) - priorityRank(a.priority),
    );
  }

  if (optimisticTasks.length === 0) {
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
            <ul>
              {list.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={onToggle} />
              ))}
            </ul>
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
          <ul className="mt-1">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={onToggle} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
