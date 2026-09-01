import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared class for text/date/time inputs and selects. */
export const controlClass =
  "w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-base outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:opacity-60 dark:border-white/20 dark:bg-white/5";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string[] | string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-zinc-400">optional</span>}
      </label>
      {children}
      {hint && !message && <p className="text-xs text-zinc-500">{hint}</p>}
      {message && <p className="text-xs text-red-600 dark:text-red-400">{message}</p>}
    </div>
  );
}
