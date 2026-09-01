import Link from "next/link";
import { CalendarRange } from "lucide-react";
import type { Semester } from "@/lib/types";
import {
  activateSemester,
  archiveSemester,
  deleteSemester,
  unarchiveSemester,
} from "@/lib/actions/semesters";
import { buttonClass } from "@/components/ui/button";
import { editSemesterHref, semesterHref } from "@/lib/routes";
import { ConfirmSubmit } from "@/components/confirm-submit";

function formatRange(s: Semester): string | null {
  if (!s.start_date && !s.end_date) return null;
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (s.start_date && s.end_date) return `${fmt(s.start_date)} – ${fmt(s.end_date)}`;
  return fmt((s.start_date ?? s.end_date)!);
}

export function SemesterCard({
  semester,
  classCount,
}: {
  semester: Semester;
  classCount: number;
}) {
  const range = formatRange(semester);
  const archived = semester.is_archived;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{semester.name}</h3>
        {semester.is_active && (
          <span className="rounded-full bg-indigo-600/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Active
          </span>
        )}
        {archived && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10">
            Archived
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        {range && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarRange className="size-3.5" />
            {range}
          </span>
        )}
        <span>
          {classCount} {classCount === 1 ? "class" : "classes"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={semesterHref(semester.id)}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          {archived ? "View classes" : "Classes"}
        </Link>

        {!archived && !semester.is_active && (
          <form action={activateSemester}>
            <input type="hidden" name="id" value={semester.id} />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
              Make active
            </button>
          </form>
        )}

        {!archived && (
          <Link
            href={editSemesterHref(semester.id)}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
        )}

        {archived ? (
          <form action={unarchiveSemester}>
            <input type="hidden" name="id" value={semester.id} />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
              Unarchive
            </button>
          </form>
        ) : (
          <form action={archiveSemester}>
            <input type="hidden" name="id" value={semester.id} />
            <ConfirmSubmit
              variant="secondary"
              message={`Archive "${semester.name}"? Its classes become read-only until you unarchive it.`}
            >
              Archive
            </ConfirmSubmit>
          </form>
        )}

        {!archived && (
          <form action={deleteSemester}>
            <input type="hidden" name="id" value={semester.id} />
            <ConfirmSubmit
              message={
                classCount > 0
                  ? `Delete "${semester.name}" and its ${classCount} ${classCount === 1 ? "class" : "classes"}? This can't be undone.`
                  : `Delete "${semester.name}"? This can't be undone.`
              }
            >
              Delete
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </li>
  );
}
