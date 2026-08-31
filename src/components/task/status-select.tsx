"use client";

import { useRef } from "react";
import type { TaskStatus } from "@/lib/types";
import { STATUSES, STATUS_LABEL } from "@/lib/priority";
import { setTaskStatus } from "@/lib/actions/tasks";
import { controlClass } from "@/components/ui/form-field";

export function StatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form action={setTaskStatus} ref={formRef}>
      <input type="hidden" name="id" value={taskId} />
      <select
        name="status"
        defaultValue={status}
        aria-label="Task status"
        onChange={() => formRef.current?.requestSubmit()}
        className={controlClass}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
