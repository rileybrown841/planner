import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClassPickerOptions } from "@/lib/data/classes";
import { createAssessment } from "@/lib/actions/assessments";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export const metadata: Metadata = { title: "New exam or project" };

export default async function NewAssessmentPage() {
  await requireUser();
  const classGroups = await listClassPickerOptions();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">New exam or project</h1>
      <AssessmentForm
        action={createAssessment}
        classGroups={classGroups}
        submitLabel="Add"
        cancelHref="/exams"
      />
    </section>
  );
}
