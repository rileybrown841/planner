"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ClassPickerGroup } from "@/lib/data/classes";
import type { Extracurricular } from "@/lib/types";
import { IDLE_RESULT } from "@/lib/form";
import { createTaskQuick } from "@/lib/actions/tasks";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/priority";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { LinkPicker } from "@/components/link-picker";

/**
 * Rendered fresh each time the dialog opens (the FAB unmounts it on close), so
 * there's no form state to reset — a successful add just closes the dialog.
 */
export function QuickAddForm({
  classGroups,
  activities,
  onDone,
}: {
  classGroups: ClassPickerGroup[];
  activities: Pick<Extracurricular, "id" | "name">[];
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(createTaskQuick, IDLE_RESULT);
  const [date, setDate] = useState("");

  const dueAt = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m - 1, d, 23, 59).toISOString();
  }, [date]);

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);

  const hasLinkTargets = classGroups.length > 0 || activities.length > 0;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="due_at" value={dueAt} />

      <FormField label="Task" htmlFor="quick-title" error={state.fieldErrors?.title}>
        <input
          id="quick-title"
          name="title"
          required
          autoFocus
          placeholder="What needs doing?"
          className={controlClass}
        />
      </FormField>

      <div className="flex flex-wrap gap-3">
        <FormField label="Due" htmlFor="quick-due" optional className="flex-1">
          <input
            id="quick-due"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={controlClass}
          />
        </FormField>
        <FormField label="Priority" htmlFor="quick-priority" className="flex-1">
          <select id="quick-priority" name="priority" defaultValue="medium" className={controlClass}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {hasLinkTargets && (
        <FormField label="Link to a class or activity" htmlFor="quick-link" optional>
          <LinkPicker id="quick-link" classGroups={classGroups} activities={activities} />
        </FormField>
      )}

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add task"}
        </Button>
      </div>
    </form>
  );
}
