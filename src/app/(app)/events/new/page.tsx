import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { createEvent } from "@/lib/actions/events";
import { EventForm } from "@/components/event/event-form";

export const metadata: Metadata = { title: "New event" };

export default async function NewEventPage({ searchParams }: PageProps<"/events/new">) {
  await requireUser();
  const [classGroups, activities, params] = await Promise.all([
    listClassPickerOptions(),
    listExtracurriculars(),
    searchParams,
  ]);
  const defaultDate = typeof params.date === "string" ? params.date : undefined;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">New event</h1>
      <EventForm
        action={createEvent}
        classGroups={classGroups}
        activities={activities}
        defaultDate={defaultDate}
        submitLabel="Add event"
        cancelHref="/calendar"
      />
    </section>
  );
}
