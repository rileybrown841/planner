"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { TaskWithLinks } from "@/lib/types";
import type { Pomodoro } from "@/components/pomodoro/use-pomodoro";
import { setTaskStatus, createQuickFocusTask } from "@/lib/actions/tasks";
import { controlClass } from "@/components/ui/form-field";
import { buttonClass } from "@/components/ui/button";
import { FocusTaskRow } from "@/components/pomodoro/focus-task-row";

/**
 * What you're aiming to get through this session — picked from your open
 * tasks (or created fresh here). Kept separate from the /tasks board; checking
 * one off marks the real task done via `setTaskStatus` and drops it from view.
 */
export function FocusTasks({ tasks, pomo }: { tasks: TaskWithLinks[]; pomo: Pomodoro }) {
  const { focusTaskIds, addFocusTask, removeFocusTask, clearFocusTasks } = pomo;
  const [, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = useMemo(
    () => focusTaskIds.map((id) => tasks.find((t) => t.id === id)).filter((t): t is TaskWithLinks => !!t),
    [focusTaskIds, tasks],
  );
  const available = useMemo(
    () => tasks.filter((t) => !focusTaskIds.includes(t.id)),
    [tasks, focusTaskIds],
  );

  function complete(task: TaskWithLinks) {
    removeFocusTask(task.id);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("status", "done");
      await setTaskStatus(fd);
    });
  }

  async function addNew() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    const result = await createQuickFocusTask(trimmed);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setTitle("");
    // The new row lands in `tasks` once /pomodoro revalidates; pin it now so
    // it doesn't wait on that round trip.
    addFocusTask(result.id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Focusing on this session
        </h2>
        {chosen.length > 0 && (
          <button
            type="button"
            onClick={clearFocusTasks}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Clear list
          </button>
        )}
      </div>

      {chosen.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Nothing pinned yet — add a task below to work through this session.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {chosen.map((task) => (
            <FocusTaskRow key={task.id} task={task} onComplete={complete} onRemove={(t) => removeFocusTask(t.id)} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {available.length > 0 && (
          <select
            aria-label="Add an existing task to this session"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) addFocusTask(e.target.value);
              e.target.value = "";
            }}
            className={`${controlClass} max-w-xs flex-1`}
          >
            <option value="" disabled>
              Add an existing task…
            </option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void addNew();
          }}
          className="flex flex-1 gap-2"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Or type a new one…"
            aria-label="New task title"
            className={`${controlClass} flex-1`}
          />
          <button type="submit" disabled={pending || !title.trim()} className={buttonClass({ variant: "secondary", size: "md" })}>
            <Plus className="size-4" />
            Add
          </button>
        </form>
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
