import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssessment } from "@/lib/data/assessments";
import { listClassPickerOptions } from "@/lib/data/classes";
import { updateAssessment } from "@/lib/actions/assessments";
import { assessmentHref } from "@/lib/routes";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export const metadata: Metadata = { title: "Edit" };

export default async function EditAssessmentPage({
  params,
}: PageProps<"/exams/[assessmentId]/edit">) {
  const { assessmentId } = await params;
  const [assessment, classGroups] = await Promise.all([
    getAssessment(assessmentId),
    listClassPickerOptions(),
  ]);
  if (!assessment) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit {assessment.title}</h1>
      <AssessmentForm
        action={updateAssessment.bind(null, assessment.id)}
        classGroups={classGroups}
        defaultValue={assessment}
        submitLabel="Save changes"
        cancelHref={assessmentHref(assessment.id)}
      />
    </section>
  );
}
