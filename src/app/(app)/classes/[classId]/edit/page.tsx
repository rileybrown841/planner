import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getClassWithSemester } from "@/lib/data/classes";
import { updateClass } from "@/lib/actions/classes";
import { classHref } from "@/lib/routes";
import { ClassForm } from "@/components/class-form";

export const metadata: Metadata = { title: "Edit class" };

export default async function EditClassPage({
  params,
}: PageProps<"/classes/[classId]/edit">) {
  const { classId } = await params;
  const cls = await getClassWithSemester(classId);
  if (!cls) notFound();
  if (cls.semester.is_archived) redirect(classHref(cls.id));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Edit {cls.name}</h1>
        <p className="text-sm text-zinc-500">{cls.semester.name}</p>
      </div>
      <ClassForm
        action={updateClass.bind(null, cls.id)}
        defaultValue={cls}
        submitLabel="Save changes"
        cancelHref={classHref(cls.id)}
      />
    </section>
  );
}
