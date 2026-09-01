import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSemester } from "@/lib/data/semesters";
import { listClasses } from "@/lib/data/classes";
import { editSemesterHref } from "@/lib/routes";
import { buttonClass } from "@/components/ui/button";
import { ClassList } from "@/components/class-list";
import { ReadOnlyBanner } from "@/components/read-only-banner";

export const metadata: Metadata = { title: "Semester" };

/** "Mar 10 – Mar 17, 2026" from two "YYYY-MM-DD" keys. */
function formatBreakRange(start: string, end: string): string {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  const md: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, md)} – ${e.toLocaleDateString(undefined, { ...md, year: "numeric" })}`;
}

export default async function SemesterDetailPage({
  params,
}: PageProps<"/semesters/[semesterId]">) {
  const { semesterId } = await params;
  const semester = await getSemester(semesterId);
  if (!semester) notFound();

  const classes = await listClasses(semester.id);

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/semesters"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        All semesters
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl">{semester.name}</h1>
        {semester.is_active && (
          <span className="rounded-full bg-indigo-600/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Active
          </span>
        )}
        {!semester.is_archived && (
          <Link
            href={editSemesterHref(semester.id)}
            className={buttonClass({ variant: "secondary", size: "sm", className: "ml-auto" })}
          >
            Edit semester
          </Link>
        )}
      </header>

      {semester.is_archived && <ReadOnlyBanner semesterName={semester.name} />}

      {semester.breaks.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Breaks</h2>
          <ul className="flex flex-col gap-0.5 text-sm text-zinc-600 dark:text-zinc-300">
            {semester.breaks.map((b) => (
              <li key={`${b.name}-${b.start}`}>
                <span className="font-medium">{b.name}</span>
                <span className="text-zinc-500"> · {formatBreakRange(b.start, b.end)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ClassList classes={classes} semesterId={semester.id} readOnly={semester.is_archived} />
    </section>
  );
}
