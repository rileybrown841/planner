"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { TaskWithLinks } from "@/lib/types";
import { taskHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { DueBadge } from "@/components/task/due-badge";
import { PriorityBadge } from "@/components/task/priority-badge";

export function TaskRow({
  task,
  onToggle,
}: {
  task: TaskWithLinks;
  /** Omit to render a read-only row (static checkbox indicator). */
  onToggle?: (task: TaskWithLinks) => void;
}) {
  const done = task.status === "done";
  const link = task.class ?? task.extracurricular;

  const boxClass = cn(
    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
    done
      ? "border-emerald-500 bg-emerald-500 text-white"
      : "border-black/25 dark:border-white/30",
    onToggle && !done && "hover:border-emerald-500",
  );

  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
      {onToggle ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          onClick={() => onToggle(task)}
          className={boxClass}
        >
          {done && <Check className="size-3.5" strokeWidth={3} />}
        </button>
      ) : (
        <span aria-hidden className={boxClass}>
          {done && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      )}

      <Link href={taskHref(task.id)} className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm",
            done && "text-zinc-400 line-through",
          )}
        >
          {task.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          {!done && <DueBadge due={task.due_date} />}
          <PriorityBadge priority={task.priority} />
          {link && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={colorDotStyle(link.color)}
              />
              {link.name}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
