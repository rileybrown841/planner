"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/ui/button";

/**
 * Submit button that asks for confirmation first. Use inside a `<form action={…}>`
 * for destructive actions (delete). Falls back to a normal submit if JS is off —
 * acceptable for a personal single-user tool.
 */
export function ConfirmSubmit({
  message,
  children,
  variant = "danger",
  size = "sm",
}: {
  message: string;
  children: ReactNode;
  variant?: "danger" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={buttonClass({ variant, size })}
    >
      {children}
    </button>
  );
}
