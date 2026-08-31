"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CLASS_COLORS, DEFAULT_CLASS_COLOR } from "@/lib/colors";
import { cn } from "@/lib/cn";

export function ColorPicker({
  name = "color",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? DEFAULT_CLASS_COLOR);

  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {CLASS_COLORS.map((color) => {
        const selected = color.hex === value;
        return (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            aria-pressed={selected}
            onClick={() => setValue(color.hex)}
            style={{ backgroundColor: color.hex }}
            className={cn(
              "grid size-9 place-items-center rounded-full text-white transition-transform",
              selected
                ? "ring-2 ring-offset-2 ring-black/60 dark:ring-white/70 dark:ring-offset-zinc-900"
                : "hover:scale-105",
            )}
          >
            {selected && <Check className="size-4" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
