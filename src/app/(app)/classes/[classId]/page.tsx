import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { getClassWithSemester } from "@/lib/data/classes";
import { listTasks } from "@/lib/data/tasks";
import { classesHref, editClassHref } from "@/lib/routes";
import { deleteClass } from "@/lib/actions/classes";
import { colorDotStyle } from "@/lib/colors";
import { DAY_LABELS, formatTime, sortMeetings } from "@/lib/days";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { ReadOnlyBanner } from "@/components/read-only-banner";
import { TaskChecklist } from "@/components/task/task-checklist";

export const metadata: Metadata = { title: "Class" };

export default async function ClassDetailPage({
  params,
}: PageProps<"/classes/[classId]">) {
  const { classId } = await params;
  const cls = await getClassWithSemester(classId);
  if (!cls) notFound();

  const readOnly = cls.semester.is_archived;
  const meetings = sortMeetings(cls.schedule ?? []);
  const backHref = classesHref(cls.semester.id, cls.semester.is_active);
  const tasks = await listTasks({ classId: cls.id, includeDone: true });

  return (
    <section className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        Back to classes
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={colorDotStyle(cls.color)}
        />
        <div className="min-w-0">
          <h1 className="font-display text-2xl">{cls.name}</h1>
          <p className="text-sm text-zinc-500">
            {[cls.code, cls.semester.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        {!readOnly && (
          <div className="ml-auto flex gap-2">
            <Link
              href={editClassHref(cls.id)}
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              Edit
            </Link>
            <form action={deleteClass}>
              <input type="hidden" name="id" value={cls.id} />
              <ConfirmSubmit message={`Delete "${cls.name}"? This can't be undone.`}>
                Delete
              </ConfirmSubmit>
            </form>
          </div>
        )}
      </header>

      {readOnly && <ReadOnlyBanner semesterName={cls.semester.name} />}

      <dl className="grid gap-4 sm:grid-cols-2">
        {cls.instructor && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Instructor</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <User className="size-4 text-zinc-400" />
              {cls.instructor}
            </dd>
          </div>
        )}
        {cls.location && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Location</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 text-zinc-400" />
              {cls.location}
            </dd>
          </div>
        )}
      </dl>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Meeting times
        </h2>
        {meetings.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No recurring meetings.</p>
        ) : (
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
        )}
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Linked tasks
        </h2>
        <div className="mt-2">
          <TaskChecklist
            tasks={tasks}
            readOnly={readOnly}
            emptyText="No tasks linked to this class yet."
          />
        </div>
      </div>
    </section>
  );
}
