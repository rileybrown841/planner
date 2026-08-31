import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { createTask } from "@/lib/actions/tasks";
import { TaskForm } from "@/components/task/task-form";

export const metadata: Metadata = { title: "New task" };

export default async function NewTaskPage() {
  await requireUser();
  const [classGroups, activities] = await Promise.all([
    listClassPickerOptions(),
    listExtracurriculars(),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">New task</h1>
      <TaskForm
        action={createTask}
        classGroups={classGroups}
        activities={activities}
        submitLabel="Add task"
        cancelHref="/tasks"
      />
    </section>
  );
}
