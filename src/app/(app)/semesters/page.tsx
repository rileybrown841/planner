import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listSemesters, classCountsBySemester } from "@/lib/data/semesters";
import { buttonClass } from "@/components/ui/button";
import { SemesterCard } from "@/components/semester-card";

export const metadata: Metadata = { title: "Semesters" };

export default async function SemestersPage({ searchParams }: PageProps<"/semesters">) {
  const [semesters, counts, params] = await Promise.all([
    listSemesters(),
    classCountsBySemester(),
    searchParams,
  ]);

  const error = typeof params.error === "string" ? params.error : undefined;
  const current = semesters.filter((s) => !s.is_archived);
  const archived = semesters.filter((s) => s.is_archived);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Semesters</h1>
          <p className="text-sm text-zinc-500">
            One semester is active at a time — that&apos;s the one Classes shows.
          </p>
        </div>
        <Link href="/semesters/new" className={buttonClass()}>
          <Plus className="size-4" />
          Add semester
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {semesters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-white/[0.02]">
          No semesters yet. Add your first one to start adding classes.
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {current.map((s) => (
              <SemesterCard key={s.id} semester={s} classCount={counts[s.id] ?? 0} />
            ))}
          </ul>

          {archived.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Archived
              </h2>
              <ul className="flex flex-col gap-3">
                {archived.map((s) => (
                  <SemesterCard key={s.id} semester={s} classCount={counts[s.id] ?? 0} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
