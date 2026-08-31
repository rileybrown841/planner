"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { Semester } from "@/lib/types";
import { activateSemester } from "@/lib/actions/semesters";

/**
 * Dropdown of non-archived semesters that switches the active one on change.
 * Only rendered when the user has more than one selectable semester.
 */
export function SemesterSwitcher({
  semesters,
  activeId,
}: {
  semesters: Semester[];
  activeId: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={activateSemester} ref={formRef} className="relative inline-flex">
      <select
        name="id"
        defaultValue={activeId ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Active semester"
        className="appearance-none rounded-lg border border-black/15 bg-white py-1.5 pl-3 pr-9 text-sm font-medium outline-none focus:border-indigo-500 dark:border-white/15 dark:bg-white/5"
      >
        {activeId === null && <option value="">No active semester</option>}
        {semesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
    </form>
  );
}
