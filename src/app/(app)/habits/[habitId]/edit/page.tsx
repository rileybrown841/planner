import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHabit } from "@/lib/data/habits";
import { updateHabit } from "@/lib/actions/habits";
import { habitHref } from "@/lib/routes";
import { HabitForm } from "@/components/habit/habit-form";

export const metadata: Metadata = { title: "Edit habit" };

export default async function EditHabitPage({ params }: PageProps<"/habits/[habitId]/edit">) {
  const { habitId } = await params;
  const habit = await getHabit(habitId);
  if (!habit) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Edit {habit.name}</h1>
      <HabitForm
        action={updateHabit.bind(null, habit.id)}
        defaultValue={habit}
        submitLabel="Save changes"
        cancelHref={habitHref(habit.id)}
      />
    </section>
  );
}
