"use client";

import { useActionState } from "react";
import { IDLE_RESULT } from "@/lib/form";
import { updateDisplayName } from "@/lib/actions/settings";
import { FormField, controlClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function DisplayNameForm({ defaultValue }: { defaultValue: string }) {
  const [state, action, pending] = useActionState(updateDisplayName, IDLE_RESULT);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <FormField
        label="Display name"
        htmlFor="display_name"
        error={state.fieldErrors?.display_name}
        hint="Shown in the greeting and sidebar. Leave blank to use your email."
      >
        <input
          id="display_name"
          name="display_name"
          defaultValue={defaultValue}
          maxLength={60}
          className={controlClass}
        />
      </FormField>

      {state.message && (
        <p
          className={
            state.status === "error"
              ? "text-sm text-red-600 dark:text-red-400"
              : "text-sm text-emerald-600 dark:text-emerald-400"
          }
        >
          {state.message}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
