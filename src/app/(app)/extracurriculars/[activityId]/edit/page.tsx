import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExtracurricular } from "@/lib/data/extracurriculars";
import { updateExtracurricular } from "@/lib/actions/extracurriculars";
import { activityHref } from "@/lib/routes";
import { ExtracurricularForm } from "@/components/extracurricular/extracurricular-form";

export const metadata: Metadata = { title: "Edit activity" };

export default async function EditExtracurricularPage({
  params,
}: PageProps<"/extracurriculars/[activityId]/edit">) {
  const { activityId } = await params;
  const activity = await getExtracurricular(activityId);
  if (!activity) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit {activity.name}</h1>
      <ExtracurricularForm
        action={updateExtracurricular.bind(null, activity.id)}
        defaultValue={activity}
        submitLabel="Save changes"
        cancelHref={activityHref(activity.id)}
      />
    </section>
  );
}
