import type { Metadata } from "next";
import { getCalendarSources } from "@/lib/data/calendar";
import { CalendarView } from "@/components/calendar/calendar-view";
import type { CalendarViewMode } from "@/components/calendar/calendar-header";

export const metadata: Metadata = { title: "Calendar" };

const VIEWS: CalendarViewMode[] = ["month", "week", "day"];

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const [sources, params] = await Promise.all([getCalendarSources(), searchParams]);

  const viewParam = typeof params.view === "string" ? params.view : "";
  const view = VIEWS.includes(viewParam as CalendarViewMode)
    ? (viewParam as CalendarViewMode)
    : "month";
  const date = typeof params.date === "string" ? params.date : "";

  return <CalendarView sources={sources} initialView={view} initialDate={date} />;
}
