"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Route } from "next";
import type { Extracurricular } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABEL } from "@/lib/activity";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";
import { MeetingsEditor } from "@/components/meetings-editor";

export function ExtracurricularForm({
  action,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValue?: Extracurricular;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name} hint='e.g. "Chess Club"'>
        <input id="name" name="name" required defaultValue={defaultValue?.name} className={controlClass} />
      </FormField>

      <div className="flex flex-wrap gap-3">
        <FormField label="Type" htmlFor="type" className="flex-1">
          <select
            id="type"
            name="type"
            defaultValue={defaultValue?.type ?? "club"}
            className={controlClass}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Colour" className="flex-1">
          <ColorPicker defaultValue={defaultValue?.color} />
        </FormField>
      </div>

      <FormField label="Meeting times" error={state.fieldErrors?.schedule} optional>
        <MeetingsEditor defaultValue={defaultValue?.schedule} />
      </FormField>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClass({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
