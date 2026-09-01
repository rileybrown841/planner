import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getAssessment } from "@/lib/data/assessments";
import { listSteps } from "@/lib/data/tasks";
import { deleteAssessment, toggleAssessmentDone } from "@/lib/actions/assessments";
import { editAssessmentHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { formatDueFull } from "@/lib/dates";
import { buttonClass, Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { DueBadge } from "@/components/task/due-badge";
import { StepList } from "@/components/task/step-list";

export const metadata: Metadata = { title: "Exam / project" };

export default async function AssessmentDetailPage({
  params,
}: PageProps<"/exams/[assessmentId]">) {
  const { assessmentId } = await params;
  const assessment = await getAssessment(assessmentId);
  if (!assessment) notFound();

  const steps = await listSteps({ assessmentId: assessment.id });
  const done = !!assessment.completed_at;
  const dueFull = formatDueFull(assessment.due_date);

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <Link
        href="/exams"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        All exams &amp; projects
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <span className="mt-1 grid size-9 place-items-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className={done ? "text-xl font-semibold tracking-tight text-zinc-400 line-through" : "text-xl font-semibold tracking-tight"}>
            {assessment.title}
          </h1>
          <p className="text-sm capitalize text-zinc-500">
            {assessment.kind}
            {assessment.class && (
              <>
                {" · "}
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={colorDotStyle(assessment.class.color)}
                  />
                  {assessment.class.name}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={editAssessmentHref(assessment.id)}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
          <form action={deleteAssessment}>
            <input type="hidden" name="id" value={assessment.id} />
            <ConfirmSubmit
              message={
                steps.length > 0
                  ? `Delete "${assessment.title}" and its ${steps.length} step${steps.length === 1 ? "" : "s"}?`
                  : `Delete "${assessment.title}"?`
              }
            >
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <form action={toggleAssessmentDone}>
          <input type="hidden" name="id" value={assessment.id} />
          <input type="hidden" name="done" value={done ? "false" : "true"} />
          <Button type="submit" variant={done ? "secondary" : "primary"} size="sm">
            {done ? "Mark not done" : "Mark done"}
          </Button>
        </form>
        {!done && assessment.due_date && <DueBadge due={assessment.due_date} />}
        {dueFull && <span className="text-sm text-zinc-500">{dueFull}</span>}
      </div>

      {assessment.notes && (
        <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          {assessment.notes}
        </p>
      )}

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Steps</h2>
        <div className="mt-2">
          <StepList steps={steps} parent={`assessment:${assessment.id}`} readOnly={done} />
        </div>
      </div>
    </section>
  );
}
