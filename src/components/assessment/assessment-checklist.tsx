"use client";

import { useOptimistic, useTransition } from "react";
import type { AssessmentWithClass } from "@/lib/types";
import { toggleAssessmentDone } from "@/lib/actions/assessments";
import { AssessmentRow } from "@/components/assessment/assessment-row";

/**
 * Flat, checkable exam/project list — used on the dashboard and /tasks so they
 * can be marked done without leaving those views. /exams stays the
 * full-featured list (notes, steps, edit, delete). Checking one off doesn't
 * remove it here (so a mis-tap is undoable in place); it drops out of the
 * "open" source list — and the /today stat tile's featured exam along with it —
 * once the page revalidates.
 */
export function AssessmentChecklist({
  assessments,
  emptyText = "Nothing here.",
}: {
  assessments: AssessmentWithClass[];
  emptyText?: string;
}) {
  const [, startTransition] = useTransition();
  const [optimistic, applyChange] = useOptimistic(
    assessments,
    (state, change: { id: string; done: boolean }) =>
      state.map((a) =>
        a.id === change.id
          ? { ...a, completed_at: change.done ? new Date().toISOString() : null }
          : a,
      ),
  );

  function onToggle(assessment: AssessmentWithClass) {
    const done = !assessment.completed_at;
    startTransition(async () => {
      applyChange({ id: assessment.id, done });
      const fd = new FormData();
      fd.set("id", assessment.id);
      fd.set("done", String(done));
      await toggleAssessmentDone(fd);
    });
  }

  if (optimistic.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {optimistic.map((a) => (
        <AssessmentRow key={a.id} assessment={a} onToggle={onToggle} />
      ))}
    </ul>
  );
}
