import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { AssessmentWithClass } from "@/lib/types";
import type { StepCount } from "@/lib/data/assessments";
import { assessmentHref, editAssessmentHref } from "@/lib/routes";
import { toggleAssessmentDone } from "@/lib/actions/assessments";
import { colorDotStyle } from "@/lib/colors";
import { buttonClass } from "@/components/ui/button";
import { DueBadge } from "@/components/task/due-badge";

export function AssessmentCard({
  assessment,
  steps,
}: {
  assessment: AssessmentWithClass;
  steps: StepCount;
}) {
  const done = !!assessment.completed_at;
  const pct = steps.total > 0 ? Math.round((steps.done / steps.total) * 100) : 0;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <form action={toggleAssessmentDone} className="pt-0.5">
          <input type="hidden" name="id" value={assessment.id} />
          <input type="hidden" name="done" value={done ? "false" : "true"} />
          <button
            type="submit"
            aria-label={done ? "Mark not done" : "Mark done"}
            className={
              done
                ? "grid size-5 place-items-center rounded-full border border-emerald-500 bg-emerald-500 text-[0.7rem] text-white"
                : "size-5 rounded-full border border-black/25 hover:border-emerald-500 dark:border-white/30"
            }
          >
            {done && "✓"}
          </button>
        </form>

        <Link href={assessmentHref(assessment.id)} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-black/[0.05] px-1.5 py-0.5 text-[0.7rem] font-medium capitalize text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300">
              <GraduationCap className="size-3" />
              {assessment.kind}
            </span>
            <h3 className={done ? "font-semibold text-zinc-400 line-through" : "font-semibold"}>
              {assessment.title}
            </h3>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            {assessment.class && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={colorDotStyle(assessment.class.color)}
                />
                {assessment.class.name}
              </span>
            )}
            {!done && assessment.due_date && <DueBadge due={assessment.due_date} />}
          </div>
        </Link>

        <Link
          href={editAssessmentHref(assessment.id)}
          className={buttonClass({ variant: "ghost", size: "sm" })}
        >
          Edit
        </Link>
      </div>

      {steps.total > 0 && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
          {steps.done}/{steps.total}
        </div>
      )}
    </li>
  );
}
