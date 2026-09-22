"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { TaskWithLinks } from "@/lib/types";
import { taskHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { DueBadge } from "@/components/task/due-badge";
import { PriorityBadge } from "@/components/task/priority-badge";

/** One task pinned to the current Pomodoro session. */
export function FocusTaskRow({
  task,
  onComplete,
  onRemove,
}: {
  task: TaskWithLinks;
  /** Marks the real task done and drops it from the session. */
  onComplete: (task: TaskWithLinks) => void;
  /** Drops it from the session only — the task itself is untouched. */
  onRemove: (task: TaskWithLinks) => void;
}) {
  const link = task.class ?? task.extracurricular;

  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
      <button
        type="button"
        role="checkbox"
        aria-checked={false}
        aria-label="Mark as done"
        onClick={() => onComplete(task)}
        className="focus-ring size-5 shrink-0 rounded-full border border-black/25 hover:border-emerald-500 hover:bg-emerald-500/10 dark:border-white/30"
      />

      <Link href={taskHref(task.id)} className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm">{task.title}</span>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <DueBadge due={task.due_date} />
          <PriorityBadge priority={task.priority} />
          {link && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <span aria-hidden className="size-2 rounded-full" style={colorDotStyle(link.color)} />
              {link.name}
            </span>
          )}
        </span>
      </Link>

      <button
        type="button"
        aria-label="Remove from this session"
        onClick={() => onRemove(task)}
        className="focus-ring grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-black/5 hover:text-zinc-600 dark:hover:bg-white/5 dark:hover:text-zinc-300"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
