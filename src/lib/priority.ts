import type { TaskPriority, TaskStatus } from "@/lib/types";

/** Lowest → highest. Used for ordering and the priority picker. */
export const PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const satisfies readonly TaskPriority[];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

/** Tailwind text/bg pairs for the badge. */
export const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: "text-zinc-500 bg-zinc-500/10",
  medium: "text-sky-700 bg-sky-500/10 dark:text-sky-300",
  high: "text-amber-700 bg-amber-500/10 dark:text-amber-300",
  urgent: "text-red-700 bg-red-500/10 dark:text-red-300",
};

/** Higher number = sorts first. */
export function priorityRank(p: TaskPriority): number {
  return PRIORITIES.indexOf(p);
}

export const STATUSES = [
  "todo",
  "in_progress",
  "done",
] as const satisfies readonly TaskStatus[];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
