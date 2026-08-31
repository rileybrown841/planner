import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Habits" };

export default function HabitsPage() {
  return (
    <PagePlaceholder title="Habits" icon={Sparkles} phase="Phase 7">
      Quick-tap counters for things like water, checklist habits for things like
      vitamins, plus daily streaks and a 7- / 30-day history.
    </PagePlaceholder>
  );
}
