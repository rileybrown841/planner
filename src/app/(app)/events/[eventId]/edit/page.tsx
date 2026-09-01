import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/events";
import { listClassPickerOptions } from "@/lib/data/classes";
import { listExtracurriculars } from "@/lib/data/extracurriculars";
import { updateEvent } from "@/lib/actions/events";
import { eventHref } from "@/lib/routes";
import { EventForm } from "@/components/event/event-form";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: PageProps<"/events/[eventId]/edit">) {
  const { eventId } = await params;
  const [event, classGroups, activities] = await Promise.all([
    getEvent(eventId),
    listClassPickerOptions(),
    listExtracurriculars(),
  ]);
  if (!event) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit {event.title}</h1>
      {event.recurrence_rule && (
        <p className="text-sm text-zinc-500">
          This is a repeating event — changes apply to the whole series.
        </p>
      )}
      <EventForm
        action={updateEvent.bind(null, event.id)}
        classGroups={classGroups}
        activities={activities}
        defaultValue={event}
        submitLabel="Save changes"
        cancelHref={eventHref(event.id)}
      />
    </section>
  );
}
