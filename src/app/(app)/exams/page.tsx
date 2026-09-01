import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAssessments, assessmentStepCounts } from "@/lib/data/assessments";
import { buttonClass } from "@/components/ui/button";
import { AssessmentCard } from "@/components/assessment/assessment-card";

export const metadata: Metadata = { title: "Exams & projects" };

const NO_STEPS = { total: 0, done: 0 };

export default async function ExamsPage({ searchParams }: PageProps<"/exams">) {
  const [assessments, stepCounts, params] = await Promise.all([
    listAssessments(),
    assessmentStepCounts(),
    searchParams,
  ]);
  const error = typeof params.error === "string" ? params.error : undefined;

  const upcoming = assessments.filter((a) => !a.completed_at);
  const done = assessments.filter((a) => a.completed_at);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Exams &amp; projects</h1>
          <p className="text-sm text-zinc-500">Sorted by nearest deadline.</p>
        </div>
        <Link href="/exams/new" className={buttonClass()}>
          <Plus className="size-4" />
          Add
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {assessments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
          No exams or projects yet. Add one and break it into study steps.
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {upcoming.map((a) => (
              <AssessmentCard key={a.id} assessment={a} steps={stepCounts[a.id] ?? NO_STEPS} />
            ))}
          </ul>

          {done.length > 0 && (
            <details className="flex flex-col gap-3">
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Done ({done.length})
              </summary>
              <ul className="mt-3 flex flex-col gap-3">
                {done.map((a) => (
                  <AssessmentCard key={a.id} assessment={a} steps={stepCounts[a.id] ?? NO_STEPS} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
