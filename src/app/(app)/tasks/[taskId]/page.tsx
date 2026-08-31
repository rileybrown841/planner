import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTask } from "@/lib/data/tasks";
import { deleteTask } from "@/lib/actions/tasks";
import { editTaskHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { PRIORITY_LABEL } from "@/lib/priority";
import { formatDueFull } from "@/lib/dates";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { StatusSelect } from "@/components/task/status-select";
import { DueBadge } from "@/components/task/due-badge";

export const metadata: Metadata = { title: "Task" };

export default async function TaskDetailPage({ params }: PageProps<"/tasks/[taskId]">) {
  const { taskId } = await params;
  const task = await getTask(taskId);
  if (!task) notFound();

  const link = task.class ?? task.extracurricular;
  const dueFull = formatDueFull(task.due_date);

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        All tasks
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight">{task.title}</h1>
        <div className="flex gap-2">
          <Link
            href={editTaskHref(task.id)}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <ConfirmSubmit message={`Delete "${task.title}"?`}>Delete</ConfirmSubmit>
          </form>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-40">
          <StatusSelect taskId={task.id} status={task.status} />
        </div>
        {task.due_date && <DueBadge due={task.due_date} />}
      </div>

      {task.description && (
        <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          {task.description}
        </p>
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Priority</dt>
          <dd className="mt-1 text-sm">{PRIORITY_LABEL[task.priority]}</dd>
        </div>
        {dueFull && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Due</dt>
            <dd className="mt-1 text-sm">{dueFull}</dd>
          </div>
        )}
        {link && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {task.class ? "Class" : "Activity"}
            </dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={colorDotStyle(link.color)}
              />
              {link.name}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
