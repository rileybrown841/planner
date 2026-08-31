import { Lock } from "lucide-react";

/** Shown on pages for an archived semester (and its classes). */
export function ReadOnlyBanner({ semesterName }: { semesterName: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      <Lock className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-medium">{semesterName}</span> is archived, so its
        classes are read-only. Unarchive it from{" "}
        <span className="font-medium">Manage semesters</span> to make changes.
      </p>
    </div>
  );
}
