import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listExtracurriculars, taskCountsByExtracurricular } from "@/lib/data/extracurriculars";
import { buttonClass } from "@/components/ui/button";
import { ExtracurricularCard } from "@/components/extracurricular/extracurricular-card";

export const metadata: Metadata = { title: "Extracurriculars" };

export default async function ExtracurricularsPage({
  searchParams,
}: PageProps<"/extracurriculars">) {
  const [activities, counts, params] = await Promise.all([
    listExtracurriculars(),
    taskCountsByExtracurricular(),
    searchParams,
  ]);
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Extracurriculars</h1>
          <p className="text-sm text-zinc-500">
            Clubs, jobs, sports — not tied to a semester.
          </p>
        </div>
        <Link href="/extracurriculars/new" className={buttonClass()}>
          <Plus className="size-4" />
          Add activity
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
          No activities yet. Add clubs, jobs or teams you want to track tasks against.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activities.map((a) => (
            <ExtracurricularCard key={a.id} activity={a} taskCount={counts[a.id] ?? 0} />
          ))}
        </div>
      )}
    </section>
  );
}
