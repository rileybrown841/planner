"use client";

import Link from "next/link";
import { Check, GraduationCap } from "lucide-react";
import type { AssessmentWithClass } from "@/lib/types";
import { assessmentHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { DueBadge } from "@/components/task/due-badge";

export function AssessmentRow({
  assessment,
  onToggle,
}: {
  assessment: AssessmentWithClass;
  /** Omit to render a read-only row (static checkbox indicator). */
  onToggle?: (assessment: AssessmentWithClass) => void;
}) {
  const done = !!assessment.completed_at;

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
          onClick={() => onToggle(assessment)}
          className={boxClass}
        >
          {done && <Check className="size-3.5" strokeWidth={3} />}
        </button>
      ) : (
        <span aria-hidden className={boxClass}>
          {done && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      )}

      <Link href={assessmentHref(assessment.id)} className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-sm", done && "text-zinc-400 line-through")}>
          {assessment.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          {!done && <DueBadge due={assessment.due_date} />}
          <span className="inline-flex items-center gap-1 text-xs capitalize text-zinc-400">
            <GraduationCap className="size-3" />
            {assessment.kind}
          </span>
          {assessment.class && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={colorDotStyle(assessment.class.color)}
              />
              {assessment.class.name}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
