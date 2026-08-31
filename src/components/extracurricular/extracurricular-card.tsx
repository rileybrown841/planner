import Link from "next/link";
import type { Extracurricular } from "@/lib/types";
import { ACTIVITY_TYPE_LABEL } from "@/lib/activity";
import { colorDotStyle } from "@/lib/colors";
import { formatMeeting, sortMeetings } from "@/lib/days";
import { activityHref } from "@/lib/routes";

export function ExtracurricularCard({
  activity,
  taskCount,
}: {
  activity: Extracurricular;
  taskCount: number;
}) {
  const meetings = sortMeetings(activity.schedule ?? []);

  return (
    <Link
      href={activityHref(activity.id)}
      className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white/60 p-4 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full"
          style={colorDotStyle(activity.color)}
        />
        <h3 className="truncate font-semibold">{activity.name}</h3>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">
          {ACTIVITY_TYPE_LABEL[activity.type]}
        </span>
        <span>
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
      </div>

      {meetings.length > 0 && (
        <p className="text-xs text-zinc-500">{meetings.map(formatMeeting).join(" · ")}</p>
      )}
    </Link>
  );
}
