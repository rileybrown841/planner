"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import type { AssessmentWithClass } from "@/lib/types";
import { addDays, startOfDay } from "@/lib/dates";
import { assessmentHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { DueBadge } from "@/components/task/due-badge";

/** Nearest not-done exams/projects due within `withinDays`. */
export function UpcomingAssessments({
  assessments,
  withinDays = 21,
}: {
  assessments: AssessmentWithClass[];
  withinDays?: number;
}) {
  const soon = useMemo(() => {
    const cutoff = addDays(startOfDay(new Date()), withinDays + 1);
    return assessments
      .filter((a) => a.due_date && new Date(a.due_date) < cutoff)
      .slice(0, 6);
  }, [assessments, withinDays]);

  if (soon.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing due soon.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {soon.map((a) => (
        <li key={a.id}>
          <Link href={assessmentHref(a.id)} className="flex items-center gap-2.5 text-sm">
            <GraduationCap className="size-4 shrink-0 text-zinc-400" />
            {a.class && (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={colorDotStyle(a.class.color)}
              />
            )}
            <span className="truncate">{a.title}</span>
            <span className="ml-auto shrink-0">
              <DueBadge due={a.due_date} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
