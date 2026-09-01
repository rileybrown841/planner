/** Preset colour tags for classes and extracurriculars — soft pastels, cool-leaning. */
export const CLASS_COLORS = [
  { name: "Sage", hex: "#7cb894" },
  { name: "Teal", hex: "#5fc0b8" },
  { name: "Sky", hex: "#7fb6de" },
  { name: "Periwinkle", hex: "#97a6e2" },
  { name: "Lilac", hex: "#bd9ad6" },
  { name: "Rose", hex: "#e29bb2" },
  { name: "Sand", hex: "#dcc48c" },
  { name: "Slate", hex: "#93a3ac" },
] as const;

export const DEFAULT_CLASS_COLOR = CLASS_COLORS[0].hex;

export const CLASS_COLOR_HEXES: string[] = CLASS_COLORS.map((c) => c.hex);

export function isValidClassColor(hex: string): boolean {
  return CLASS_COLOR_HEXES.includes(hex);
}

/** Inline style for a small round colour swatch / dot. */
export function colorDotStyle(hex: string | null | undefined) {
  return { backgroundColor: hex ?? "var(--muted, #71717a)" };
}
