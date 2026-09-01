import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createSemester } from "@/lib/actions/semesters";
import { SemesterForm } from "@/components/semester-form";

export const metadata: Metadata = { title: "New semester" };

export default async function NewSemesterPage() {
  await requireUser();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New semester</h1>
      <SemesterForm action={createSemester} submitLabel="Create semester" cancelHref="/semesters" />
    </section>
  );
}
