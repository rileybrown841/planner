import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createHabit } from "@/lib/actions/habits";
import { HabitForm } from "@/components/habit/habit-form";

export const metadata: Metadata = { title: "New habit" };

export default async function NewHabitPage() {
  await requireUser();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New habit</h1>
      <HabitForm action={createHabit} submitLabel="Add habit" cancelHref="/habits" />
    </section>
  );
}
