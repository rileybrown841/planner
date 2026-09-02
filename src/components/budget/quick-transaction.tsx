"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { BudgetCategory } from "@/lib/types";
import { IDLE_RESULT } from "@/lib/form";
import { toDateKey } from "@/lib/dates";
import { createTransactionQuick } from "@/lib/actions/budget";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";

/** Fast expense capture on the overview. Income / dated entries use the full form. */
export function QuickTransaction({ categories }: { categories: BudgetCategory[] }) {
  const [state, formAction, pending] = useActionState(createTransactionQuick, IDLE_RESULT);
  const formRef = useRef<HTMLFormElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [today] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      amountRef.current?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="type" value="expense" />
      <input type="hidden" name="occurred_on" value={today} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-zinc-500">$</span>
          <input
            ref={amountRef}
            name="amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            placeholder="Amount"
            aria-label="Amount"
            className={`${controlClass} w-28`}
          />
        </div>
        <select name="category_id" aria-label="Category" defaultValue="" className={`${controlClass} w-auto flex-1`}>
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={buttonClass({ size: "sm" })}>
          <Plus className="size-4" />
          {pending ? "Adding…" : "Add expense"}
        </button>
      </div>

      {state.status === "error" && state.message && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
      )}
    </form>
  );
}
