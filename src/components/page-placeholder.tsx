import type { ComponentType, ReactNode } from "react";

/**
 * Consistent "not built yet" screen for sections that land in later phases.
 * Keeps the navigation shell fully walkable during phase 1.
 */
export function PagePlaceholder({
  title,
  icon: Icon,
  phase,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  phase: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {phase}
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-6 text-sm leading-relaxed text-zinc-600 dark:border-white/15 dark:bg-white/[0.02] dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}
