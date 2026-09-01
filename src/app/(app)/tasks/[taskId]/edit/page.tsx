import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTask } from "@/lib/data/tasks";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { updateTask } from "@/lib/actions/tasks";
import { taskHref } from "@/lib/routes";
import { TaskForm } from "@/components/task/task-form";

export const metadata: Metadata = { title: "Edit task" };

export default async function EditTaskPage({ params }: PageProps<"/tasks/[taskId]/edit">) {
  const { taskId } = await params;
  const [task, classGroups, activities] = await Promise.all([
    getTask(taskId),
    listClassPickerOptions(),
    listExtracurriculars(),
  ]);
  if (!task) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Edit task</h1>
      <TaskForm
        action={updateTask.bind(null, task.id)}
        classGroups={classGroups}
        activities={activities}
        defaultValue={task}
        submitLabel="Save changes"
        cancelHref={taskHref(task.id)}
        showStatus
      />
    </section>
  );
}
