import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <PagePlaceholder title="Tasks" icon={ListChecks} phase="Phase 3">
      Fast quick-add capture so nothing slips, plus priority, status, links to a
      class or activity, and filtering by due date or category.
    </PagePlaceholder>
  );
}
