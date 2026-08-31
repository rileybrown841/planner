import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSemester } from "@/lib/data/semesters";
import { updateSemester } from "@/lib/actions/semesters";
import { SemesterForm } from "@/components/semester-form";

export const metadata: Metadata = { title: "Edit semester" };

export default async function EditSemesterPage({
  params,
}: PageProps<"/semesters/[semesterId]/edit">) {
  const { semesterId } = await params;
  const semester = await getSemester(semesterId);

  if (!semester) notFound();
  // Archived semesters are read-only — bounce back to the list.
  if (semester.is_archived) redirect("/semesters");

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit {semester.name}</h1>
      <SemesterForm
        action={updateSemester.bind(null, semester.id)}
        defaultValue={semester}
        submitLabel="Save changes"
        cancelHref="/semesters"
      />
    </section>
  );
}
