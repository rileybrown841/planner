"use client";

import { useOptimistic, useTransition } from "react";
import type { TaskStatus, TaskWithLinks } from "@/lib/types";
import { setTaskStatus } from "@/lib/actions/tasks";
import { TaskRow } from "@/components/task/task-row";

/**
 * Flat, checkable task list (no date buckets). Used on the dashboard and the
 * activity detail page. `/tasks` uses <TaskBoard> instead.
 */
export function TaskChecklist({
  tasks,
  emptyText = "Nothing here.",
}: {
  tasks: TaskWithLinks[];
  emptyText?: string;
}) {
  const [, startTransition] = useTransition();
  const [optimistic, applyChange] = useOptimistic(
    tasks,
    (state, change: { id: string; status: TaskStatus }) =>
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

  if (optimistic.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <ul>
      {optimistic.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={onToggle} />
      ))}
    </ul>
  );
}
