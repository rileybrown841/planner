import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getEvent } from "@/lib/data/events";
import { deleteEvent } from "@/lib/actions/events";
import { editEventHref } from "@/lib/routes";
import { colorDotStyle } from "@/lib/colors";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EventWhen } from "@/components/event/event-when";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({ params }: PageProps<"/events/[eventId]">) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) notFound();

  const link = event.class ?? event.extracurricular;

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" />
        Calendar
      </Link>

      <header className="flex flex-wrap items-start gap-3">
        <h1 className="min-w-0 flex-1 font-display text-2xl">{event.title}</h1>
        <div className="flex gap-2">
          <Link
            href={editEventHref(event.id)}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={event.id} />
            <ConfirmSubmit
              message={
                event.recurrence_rule
                  ? `Delete "${event.title}" and its whole repeating series?`
                  : `Delete "${event.title}"?`
              }
            >
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </header>

      <p className="text-sm">
        <EventWhen
          startsAt={event.starts_at}
          endsAt={event.ends_at}
          allDay={event.all_day}
          recurrence={event.recurrence_rule}
        />
      </p>

      <dl className="grid gap-4 sm:grid-cols-2">
        {event.location && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Location</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 text-zinc-400" />
              {event.location}
            </dd>
          </div>
        )}
        {link && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {event.class ? "Class" : "Activity"}
            </dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={colorDotStyle(link.color)}
              />
              {link.name}
            </dd>
          </div>
        )}
      </dl>

      {event.notes && (
        <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          {event.notes}
        </p>
      )}
    </section>
  );
}
