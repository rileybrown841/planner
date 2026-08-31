/** Preset colour tags for classes (and later extracurriculars). Stored as hex. */
export const CLASS_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Sky", hex: "#0ea5e9" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Slate", hex: "#64748b" },
] as const;

export const DEFAULT_CLASS_COLOR = CLASS_COLORS[0].hex;

export const CLASS_COLOR_HEXES: string[] = CLASS_COLORS.map((c) => c.hex);

export function isValidClassColor(hex: string): boolean {
  return CLASS_COLOR_HEXES.includes(hex);
}

/** Inline style for a small round colour swatch / dot. */
export function colorDotStyle(hex: string | null | undefined) {
  return { backgroundColor: hex ?? "var(--color-zinc-400, #a1a1aa)" };
}
