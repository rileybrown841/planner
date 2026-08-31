"use client";

import { useMemo } from "react";
import type { TaskWithLinks } from "@/lib/types";
import { bucketFor } from "@/lib/dates";
import { TaskChecklist } from "@/components/task/task-checklist";

/**
 * Dashboard widget: open tasks that are overdue or due today. Filtering happens
 * here (client) so it uses the viewer's local day boundary.
 */
export function DueSoon({ tasks }: { tasks: TaskWithLinks[] }) {
  const soon = useMemo(
    () => tasks.filter((t) => ["overdue", "today"].includes(bucketFor(t.due_date))),
    [tasks],
  );

  return <TaskChecklist tasks={soon} emptyText="Nothing due today. Nice." />;
}
