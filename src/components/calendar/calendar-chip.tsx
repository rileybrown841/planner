import Link from "next/link";
import type { CalendarItem } from "@/lib/types";
import { colorDotStyle } from "@/lib/colors";
import { cn } from "@/lib/cn";

/** Small pill for the month grid and the all-day row. */
export function CalendarChip({ item }: { item: CalendarItem }) {
  const isTask = item.kind === "task";
  const isAssessment = item.kind === "assessment";
  const time =
    !item.allDay && !isTask && !isAssessment
      ? item.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(":00", "")
      : null;

  return (
    <Link
      href={item.href}
      title={item.title}
      className={cn(
        "focus-ring flex items-center gap-1 truncate rounded px-1 py-0.5 text-[0.7rem] leading-tight",
        isTask
          ? "border border-dashed border-black/25 text-zinc-600 dark:border-white/30 dark:text-zinc-300"
          : isAssessment
            ? "font-medium text-zinc-800 ring-1 ring-inset ring-black/15 dark:text-zinc-100 dark:ring-white/20"
            : "bg-black/[0.04] text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-200",
      )}
    >
      <span
        aria-hidden
        className={cn("shrink-0 rounded-full", isAssessment ? "size-2" : "size-1.5")}
        style={colorDotStyle(item.color)}
      />
      {time && <span className="shrink-0 tabular-nums text-zinc-400">{time}</span>}
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
