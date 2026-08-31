import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getExtracurricular } from "@/lib/data/extracurriculars";
import { listTasks } from "@/lib/data/tasks";
import { deleteExtracurricular } from "@/lib/actions/extracurriculars";
import { editActivityHref } from "@/lib/routes";
import { ACTIVITY_TYPE_LABEL } from "@/lib/activity";
import { colorDotStyle } from "@/lib/colors";
import { DAY_LABELS, formatTime, sortMeetings } from "@/lib/days";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { TaskChecklist } from "@/components/task/task-checklist";

export const metadata: Metadata = { title: "Activity" };

export default async function ExtracurricularDetailPage({
  params,
}: PageProps<"/extracurriculars/[activityId]">) {
  const { activityId } = await params;
  const activity = await getExtracurricular(activityId);
  if (!activity) notFound();

  const tasks = await listTasks({ activityId: activity.id, includeDone: true });
  const meetings = sortMeetings(activity.schedule ?? []);

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/extracurriculars"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        All extracurriculars
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={colorDotStyle(activity.color)}
        />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{activity.name}</h1>
          <p className="text-sm text-zinc-500">{ACTIVITY_TYPE_LABEL[activity.type]}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href={editActivityHref(activity.id)}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
          <form action={deleteExtracurricular}>
            <input type="hidden" name="id" value={activity.id} />
            <ConfirmSubmit
              message={`Delete "${activity.name}"? Linked tasks stay, but lose the link.`}
            >
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </header>

      {meetings.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Meeting times
          </h2>
          <ul className="mt-2 divide-y divide-black/5 rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
            {meetings.map((m, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium">{DAY_LABELS[m.day]}</span>
                <span className="text-zinc-500">
                  {formatTime(m.start)} – {formatTime(m.end)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Linked tasks
        </h2>
        <div className="mt-2">
          <TaskChecklist tasks={tasks} emptyText="No tasks linked to this activity yet." />
        </div>
      </div>
    </section>
  );
}
