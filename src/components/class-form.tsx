"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Route } from "next";
import type { Class } from "@/lib/types";
import { IDLE_RESULT, type ActionResult } from "@/lib/form";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button, buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";
import { MeetingsEditor } from "@/components/meetings-editor";

export function ClassForm({
  action,
  defaultValue,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValue?: Class;
  submitLabel: string;
  cancelHref: Route;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_RESULT);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name} hint='e.g. "Organic Chemistry I"'>
        <input id="name" name="name" required defaultValue={defaultValue?.name} className={controlClass} />
      </FormField>

      <div className="flex gap-3">
        <FormField label="Code" htmlFor="code" error={state.fieldErrors?.code} optional className="flex-1">
          <input id="code" name="code" defaultValue={defaultValue?.code ?? ""} placeholder="CHEM 201" className={controlClass} />
        </FormField>
        <FormField label="Location" htmlFor="location" error={state.fieldErrors?.location} optional className="flex-1">
          <input id="location" name="location" defaultValue={defaultValue?.location ?? ""} placeholder="Science Hall 3" className={controlClass} />
        </FormField>
      </div>

      <FormField label="Instructor" htmlFor="instructor" error={state.fieldErrors?.instructor} optional>
        <input id="instructor" name="instructor" defaultValue={defaultValue?.instructor ?? ""} className={controlClass} />
      </FormField>

      <FormField label="Colour" error={state.fieldErrors?.color}>
        <ColorPicker defaultValue={defaultValue?.color} />
      </FormField>

      <FormField label="Meeting times" error={state.fieldErrors?.schedule}>
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
