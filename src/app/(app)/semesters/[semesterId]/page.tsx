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
        <h1 className="text-xl font-semibold tracking-tight">{semester.name}</h1>
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

      <ClassList classes={classes} semesterId={semester.id} readOnly={semester.is_archived} />
    </section>
  );
}
