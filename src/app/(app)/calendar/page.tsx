import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <PagePlaceholder title="Calendar" icon={CalendarDays} phase="Phase 4">
      Day, week and month views that merge class schedules, extracurricular
      meetings, one-off events and task due dates into one colour-coded calendar.
    </PagePlaceholder>
  );
}
