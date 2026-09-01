"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { IDLE_RESULT } from "@/lib/form";
import { addStep } from "@/lib/actions/tasks";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";

/** Inline one-field adder for a checklist step. `parent` = "task:<id>" | "assessment:<id>". */
export function StepAdder({ parent }: { parent: string }) {
  const [state, action, pending] = useActionState(addStep, IDLE_RESULT);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="parent" value={parent} />
      <div className="flex gap-2">
        <input
          name="title"
          required
          placeholder="Add a step…"
          className={controlClass}
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClass({ variant: "secondary", size: "md" })}
        >
          <Plus className="size-4" />
        </button>
      </div>
      {state.status === "error" && state.message && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}
