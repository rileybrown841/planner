import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSemester, getActiveSemester } from "@/lib/data/semesters";
import { createClass } from "@/lib/actions/classes";
import { classesHref } from "@/lib/routes";
import { ClassForm } from "@/components/class-form";

export const metadata: Metadata = { title: "New class" };

export default async function NewClassPage({ searchParams }: PageProps<"/classes/new">) {
  const params = await searchParams;
  const requested = typeof params.semester === "string" ? params.semester : null;

  const semester = requested ? await getSemester(requested) : await getActiveSemester();
  if (!semester) {
    // No semester to attach the class to — send them to pick/create one.
    redirect("/semesters");
  }
  if (semester.is_archived) notFound();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New class</h1>
        <p className="text-sm text-zinc-500">Adding to {semester.name}</p>
      </div>
      <ClassForm
        action={createClass.bind(null, semester.id)}
        submitLabel="Add class"
        cancelHref={classesHref(semester.id, semester.is_active)}
      />
    </section>
  );
}
