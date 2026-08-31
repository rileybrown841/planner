import Link from "next/link";
import { Plus } from "lucide-react";
import type { Class } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";
import { newClassHref } from "@/lib/routes";
import { ClassCard } from "@/components/class-card";

export function ClassList({
  classes,
  semesterId,
  readOnly,
}: {
  classes: Class[];
  semesterId: string;
  readOnly: boolean;
}) {
  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
        <p className="text-sm text-zinc-500">
          {readOnly ? "This semester has no classes." : "No classes in this semester yet."}
        </p>
        {!readOnly && (
          <Link href={newClassHref(semesterId)} className={buttonClass({ className: "mt-3" })}>
            <Plus className="size-4" />
            Add your first class
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} />
        ))}
      </div>
      {!readOnly && (
        <Link
          href={newClassHref(semesterId)}
          className={buttonClass({ variant: "secondary", size: "sm", className: "self-start" })}
        >
          <Plus className="size-4" />
          Add class
        </Link>
      )}
    </div>
  );
}
