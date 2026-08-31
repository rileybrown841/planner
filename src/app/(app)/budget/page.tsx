import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPage() {
  return (
    <PagePlaceholder title="Budget" icon={Wallet} phase="Phase 8">
      Monthly categories with spending limits, quick transaction logging, and a
      progress bar per category against a simple month summary.
    </PagePlaceholder>
  );
}
