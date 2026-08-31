import type { Metadata } from "next";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { getActiveSemester, listSemesters } from "@/lib/data/semesters";
import { listClasses } from "@/lib/data/classes";
import { buttonClass } from "@/components/ui/button";
import { SemesterSwitcher } from "@/components/semester-switcher";
import { ClassList } from "@/components/class-list";

export const metadata: Metadata = { title: "Classes" };

export default async function ClassesPage({ searchParams }: PageProps<"/classes">) {
  const [active, semesters, params] = await Promise.all([
    getActiveSemester(),
    listSemesters(),
    searchParams,
  ]);
  const error = typeof params.error === "string" ? params.error : undefined;
  const selectable = semesters.filter((s) => !s.is_archived);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Classes</h1>
          {active && selectable.length > 1 && (
            <SemesterSwitcher semesters={selectable} activeId={active.id} />
          )}
        </div>
        <Link
          href="/semesters"
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <Settings2 className="size-4" />
          Manage semesters
        </Link>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {active ? (
        <>
          <p className="text-sm text-zinc-500">
            {active.name} · active semester
          </p>
          <ClassList
            classes={await listClasses(active.id)}
            semesterId={active.id}
            readOnly={false}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
          <p className="text-sm text-zinc-500">
            {semesters.length === 0
              ? "No semesters yet. Create one to start adding classes."
              : "No active semester. Pick one to work in."}
          </p>
          <Link href={semesters.length === 0 ? "/semesters/new" : "/semesters"} className={buttonClass({ className: "mt-3" })}>
            {semesters.length === 0 ? "Create a semester" : "Choose a semester"}
          </Link>
        </div>
      )}
    </section>
  );
}
