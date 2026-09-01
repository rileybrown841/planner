import type { TaskWithLinks } from "@/lib/types";
import { TaskChecklist } from "@/components/task/task-checklist";
import { StepAdder } from "@/components/task/step-adder";

/** Checklist of a task's or assessment's steps, with an inline adder. */
export function StepList({
  steps,
  parent,
  readOnly = false,
}: {
  steps: TaskWithLinks[];
  /** "task:<id>" | "assessment:<id>" */
  parent: string;
  readOnly?: boolean;
}) {
  const done = steps.filter((s) => s.status === "done").length;

  return (
    <div className="flex flex-col gap-3">
      {steps.length > 0 && (
        <>
          <p className="text-xs text-zinc-400">
            {done} / {steps.length} done
          </p>
          <TaskChecklist tasks={steps} readOnly={readOnly} />
        </>
      )}
      {!readOnly && <StepAdder parent={parent} />}
      {steps.length === 0 && readOnly && (
        <p className="text-sm text-zinc-500">No steps.</p>
      )}
    </div>
  );
}
