import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Exams & projects" };

export default function ExamsPage() {
  return (
    <PagePlaceholder title="Exams & projects" icon={GraduationCap} phase="Phase 5">
      Countdowns to every upcoming exam and project, each broken into a mini
      checklist of linked study tasks, sorted by nearest deadline.
    </PagePlaceholder>
  );
}
