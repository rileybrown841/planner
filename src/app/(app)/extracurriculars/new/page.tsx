import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createExtracurricular } from "@/lib/actions/extracurriculars";
import { ExtracurricularForm } from "@/components/extracurricular/extracurricular-form";

export const metadata: Metadata = { title: "New activity" };

export default async function NewExtracurricularPage() {
  await requireUser();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New activity</h1>
      <ExtracurricularForm
        action={createExtracurricular}
        submitLabel="Add activity"
        cancelHref="/extracurriculars"
      />
    </section>
  );
}
