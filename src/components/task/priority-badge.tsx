import type { TaskPriority } from "@/lib/types";
import { PRIORITY_LABEL, PRIORITY_STYLE } from "@/lib/priority";
import { cn } from "@/lib/cn";

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  // "medium" is the default — don't clutter the row with it.
  if (priority === "medium") return null;
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[0.7rem] font-medium",
        PRIORITY_STYLE[priority],
        className,
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
