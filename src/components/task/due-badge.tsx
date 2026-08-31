"use client";

import { CalendarClock } from "lucide-react";
import { bucketFor, formatRelativeDue } from "@/lib/dates";
import { cn } from "@/lib/cn";

/** Relative due label; red when overdue, amber for today. Client so it uses local time. */
export function DueBadge({ due, className }: { due: string | null; className?: string }) {
  if (!due) return null;
  const bucket = bucketFor(due);
  const tone =
    bucket === "overdue"
      ? "text-red-600 dark:text-red-400"
      : bucket === "today"
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-500";

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", tone, className)}>
      <CalendarClock className="size-3.5" />
      {formatRelativeDue(due)}
    </span>
  );
}
